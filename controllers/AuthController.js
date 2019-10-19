let View = require('../views/base');
let path = require('path');
let fs = require('fs');
let crypto = require('crypto');
let config = require('../config/index')();
let nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    // service: "gmail",
    // auth: {
    //     user: config.mail_info.user,
    //     pass: config.mail_info.password
    // }


    host: 'smtp.gmail.com', // Gmail Host
    port: 587, // Port
    secure: false, // this is true as port is 465
    auth: {
        type: 'plain',
        user: config.mail_info.user,
        pass: config.mail_info.password
    },
    tls: {
        rejectUnauthorized: false
    }
});

let SMSAPI = require('smsapi');
let smsapi = new SMSAPI({
    server: 'https://api2.smsapi.pl/'
});
let speakeasy = require('speakeasy');
let ejs = require('ejs');

let BaseController = require('./BaseController');
let GroupModel = require('../models/user_ms/GroupModel');
let UserModel = require('../models/user_ms/UserModel');
let PaymentModel = require('../models/user_ms/PaymentModel');
let NotificationModel = require('../models/user_ms/NotificationModel');

module.exports = BaseController.extend({
    name: 'AuthController',
    login: async function (req, res, next) {
        if (req.session.login === 1) return res.redirect('/');
        await this.init_data();
        await this.checkDev();
        let v = new View(res, 'auth/login');
        v.render({
            title: 'Boom Invest S/A | Login',
            session: req.session,
            i18n: res,
        })
    },
    register: async function (req, res, next) {
        if (req.session.login === 1) return res.redirect('/');
        let groups = await GroupModel.find({role: {$nin: [0, 1, 2]}});
        let v = new View(res, 'auth/register');
        v.render({
            title: 'Boom Invest S/A | Register',
            session: req.session,
            i18n: res,
            groups: groups
        })
    },
    forgotPassword: async function (req, res, next) {
        if (req.session.login === 1) return res.redirect('/');
        let v = new View(res, 'auth/forgot_password');
        v.render({
            title: 'Boom Invest S/A | Forgot password',
            session: req.session,
            i18n: res,
        })
    },
    resetPassword: async function (req, res, next) {
        if (req.session.login === 1) return res.redirect('/');
        let token = req.query.token;
        if (!token) return res.redirect('/404');
        let user = await UserModel.findOne({reset_token: token});
        if (!user) return res.redirect('/404');
        req.session.user = user;
        let v = new View(res, 'auth/reset_password');
        v.render({
            title: 'Boom Invest S/A | Forgot password',
            session: req.session,
            i18n: res,
        })
    },
    logout: async function (req, res, next) {
        req.session.login = 0;
        req.session.user = null;
        req.session.save();
        return res.redirect('/');
    },
    postLogin: async function (req, res, next) {
        let login_email = req.body.login_email;
        let login_password = req.body.login_password;
        if (login_email === '' || login_password === '' || login_email.indexOf('@') <= 0) {
            return res.send({status: 'error', message: res.cookie().__('Login information is not valid')});
        }
        let user = await UserModel.findOne({email: login_email});
        if (!user) return res.send({status: 'error', message: res.cookie().__('Unknown user')});
        if (user.email_verify_flag !== 2) return res.send({status: 'error', message: res.cookie().__('Verify your email')});
        if (!user.verifyPassword(login_password)) return res.send({status: 'error', message: res.cookie().__('Password is not correct')});
        req.session.user = user;

        let group = await GroupModel.findOne({id: user.group_id});
        if (group) req.session.group = group;

        if (!user.factor2) {
            let factor2_key = speakeasy.generateSecret({length: 21}).base32;
            await user.updateOne({factor2: factor2_key, factor2_flag: 2});
            req.session.user.factor2 = factor2_key;
            req.session.user.factor2_flag = 2;
        } else if (user.factor2 && user.factor2_flag === 1) {
            let factor2_code = req.body.factor2_code;
            if (!factor2_code) return res.send({status: "factor", message: res.cookie().__('Please Verify 2 Factor Code')});
            let factor2_verify = speakeasy.totp.verify({
                secret: user.factor2,
                encoding: 'base32',
                token: factor2_code
            });
            if (!factor2_verify) return res.send({status: 'error', message: res.cookie().__('Google Authenticated Token is incorrect')});
        }
        if (user.phone_verify_flag !== 2) return res.send({status: 'phone_verification', message: res.cookie().__('Verify your phone')});
        req.session.login = 1;
        return res.send({status: 'success', message: res.cookie().__('Login success')});
    },
    postRegister: async function (req, res, next) {
        let register_f_name = req.body.register_f_name;
        let register_email = req.body.register_email;
        let register_password = req.body.register_password;
        if (register_f_name === '' || register_email === '' || register_password === '')
            return res.send({status: 'error', message: res.cookie().__('Register fields are not valid')});
        let check_user = await UserModel.findOne({email: register_email});
        if (check_user) return res.send({status: 'error', message: res.cookie().__('Email is registered already')});
        let check_group = await GroupModel.findOne({name: 'Guest'});
        let email_token_str = "boom" + Date.now().toString() + (Math.random() * 101).toString() + 'email';
        let email_verify_token = crypto.createHash('md5').update(email_token_str).digest('hex');
        let factor2_key = speakeasy.generateSecret({length: 21}).base32;
        let new_user = new UserModel({
            first_name: register_f_name,
            last_name: '',
            email: register_email,
            password: register_password,
            email_verify_flag: 1,
            email_verify_token: email_verify_token,
            phone_verify_flag: 2,
            avatar: '/images/profiles/default.png',
            group_id: check_group.id,
            online_state: 1,
            factor2: factor2_key,
            factor2_flag: 2,
            multiStorePro: 1,
        });
        let user = await new_user.save();
        let new_notification = new NotificationModel({
            user_id: user.id,
            email: {
                order: false,
                message: false,
                day: false,
                week: false,
                month: false,
                year: false
            },
            sms: {
                earnings: false,
                week: false,
                month: false,
                year: false,
            },
            browser: {
                order: false,
                message: false,
            }
        });
        await new_notification.save();
        let new_payments = new PaymentModel({
            user_id: user.id,
            BANK_address: "",
            BTC_address: "",
            GECA_address: "",
            CCC_address: "",
            totalWithdrawAmount: 0,
            currentWithdrawAmount: 0,
            currentWithdrawDate: new Date(),
        });
        await new_payments.save();
        let verify_email_link = config.base_url + "/auth/verification-email?token=" + email_verify_token;
        let template = 'views/templates/verify_email.ejs';
        let templateData = {
            verify_email_link: verify_email_link,
            base_url: config.base_url,
            i18n: res,
        };
        console.log(config.base_url + verify_email_link);
        ejs.renderFile(template, templateData, (err, html) => {
            if (err) {
                console.log('[' + new Date() + ']', "EMAIL TEMPLATE RENDER ERROR", err);
                return res.send({status: 'fail', message: res.cookie().__('html rendering failed')});
            }
            let mailOpts = {
                from: 'Boom Invest S/A',
                to: register_email,
                subject: 'Notification center',
                html: html
            };
            transporter.sendMail(mailOpts, async (err, info) => {
                if (err) {
                    console.log('[' + new Date() + ']', "MAIL SENDING ERROR", err);
                    return res.send({status: 'fail', message: res.cookie().__('Email sending failed')});
                }
                console.log('[' + new Date() + '] Mail sending success ', JSON.stringify(info));
                return res.send({status: 'success', message: res.cookie().__('Registered successfully. Please check your email verification')});
            });
        });
    },
    postForgotPassword: async function (req, res, next) {
        let forgot_email = req.body.forgot_email;
        let user = await UserModel.findOne({email: forgot_email});
        if (!user) return res.send({status: 'error', message: res.cookie().__('Unknown user')});
        let forgot_token_str = "boom" + Date.now().toString() + (Math.random() * 101).toString() + 'forgot';
        let forgot_token = crypto.createHash('md5').update(forgot_token_str).digest('hex');

        let verify_email_link = config.base_url + "/auth/reset-password?token=" + forgot_token;
        let template = 'views/templates/reset_password.ejs';
        let templateData = {
            reset_password_link: verify_email_link,
            base_url: config.base_url,
            i18n: res,
        };
        ejs.renderFile(template, templateData, (err, html) => {
            if (err) {
                console.log('[' + new Date() + ']', "EMAIL TEMPLATE RENDER ERROR", err);
                return res.send({status: 'fail', message: res.cookie().__('html rendering failed')});
            }
            let mailOpts = {
                from: 'Boom Invest S/A',
                to: forgot_email,
                subject: 'Notification center',
                html: html
            };
            transporter.sendMail(mailOpts, async (err, info) => {
                if (err) {
                    console.log('[' + new Date() + ']', "MAIL SENDING ERROR", err);
                    return res.send({status: 'error', message: 'Failed sending message to your email'});
                }
                console.log('[' + new Date() + '] Mail sending success ', JSON.stringify(info));
                await user.updateOne({reset_flag: 1, reset_token: forgot_token});
                return res.send({status: 'success', message: res.cookie().__('Please check your email')});
            });
        });
    },
    postResetPassword: async function (req, res, next) {
        if (!req.session.user) return res.send({status: 'error', message: res.cookie().__('Unknown user')});
        let user = await UserModel.findOne({id: req.session.user.id});
        if (!user) return res.send({status: 'error', message: res.cookie().__('Unknown user')});
        user.password = req.body.new_password;
        await user.save();
        return res.send({status: 'success', message: res.cookie().__('Updated password successfully')});
    },
    verify_email: async function (req, res, next) {
        let token = req.query.token;
        if (!token) {
            let v = new View(res, 'auth/email_verify');
            v.render({
                title: 'Boom Invest S/A | Phone verify',
                session: req.session,
                i18n: res,
            })
        } else {
            let user = await UserModel.findOne({email_verify_token: token});
            if (!user) return res.redirect('/404');
            await user.updateOne({email_verify_flag: 2, email_verify_token: ''});
            return res.redirect('/');
        }

    },
    postVerifyEmail: async function (req, res, next) {
        let verify_email = req.body.verify_email;
        let user = await UserModel.findOne({email: verify_email});
        if (!user) return res.send({status: 'error', message: res.cookie().__('Unknown user')});
        let email_token_str = "boom" + Date.now().toString() + (Math.random() * 101).toString() + 'email';
        let email_verify_token = crypto.createHash('md5').update(email_token_str).digest('hex');

        let verify_email_link = config.base_url + "/auth/verification-email?token=" + email_verify_token;
        let template = 'views/templates/verify_email.ejs';
        let templateData = {
            verify_email_link: verify_email_link,
            base_url: config.base_url,
            i18n: res,
        };
        ejs.renderFile(template, templateData, (err, html) => {
            if (err) {
                console.log('[' + new Date() + ']', "EMAIL TEMPLATE RENDER ERROR", err);
                return res.send({status: 'fail', message: res.cookie().__('html rendering failed')});
            }
            let mailOpts = {
                from: 'Boom Invest S/A',
                to: verify_email,
                subject: 'Notification center',
                html: html
            };
            transporter.sendMail(mailOpts, async (err, info) => {
                if (err) {
                    console.log('[' + new Date() + ']', "MAIL SENDING ERROR", err);
                    return res.send({status: 'fail', message: res.cookie().__('Email sending failed')});
                }
                console.log('[' + new Date() + '] Mail sending success ', JSON.stringify(info));
                await user.updateOne({email_verify_flag: 1, email_verify_token: email_verify_token});
                return res.send({status: 'success', message: res.cookie().__('Please check your email verification')});
            });
        });
    },
    verify_phone: async function (req, res, next) {
        let v = new View(res, 'auth/phone_verify');
        v.render({
            title: 'Boom Invest S/A | Phone verify',
            session: req.session,
            i18n: res,
        })
    },
    postVerifyPhone: async function (req, res, next) {
        if (!req.session.user) return res.send({status: 'error', message: res.cookie().__('Unknown user')});
        let user = await UserModel.findOne({id: req.session.user.id});
        if (!user) return res.send({status: 'error', message: res.cookie().__('Unknown user')});
        let phone = req.body.phone_number;
        if (phone.substr(0, 1) == '0') phone = phone.substr(1, phone.length);
        let dialCode = req.body.dialCode;
        let iso2 = req.body.iso2;
        let regex = /^\d+$/;
        if (!regex.test(phone)) res.send({status: 'error', message: res.cookie().__('Phone number format is not valid')});
        // sending sms code
        let phone_number = dialCode + phone;
        let verify_code = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(iso2, phone_number, verify_code);
        return smsapi.authentication.loginHashed(config.sms_info.username, config.sms_info.password)
        .then(function () {
            return smsapi.message.sms().from('Boom Invest S/A').to(phone_number).message(verify_code).execute();
        }).then(async function (result) {
            console.log("success: ", result);
            await user.updateOne({phone: phone, dialCode: dialCode, iso2: iso2});
            req.session.user.phone = phone;
            req.session.user.phone_verify_token = verify_code;
            req.session.save();
            return res.send({status: 'success', message: res.cookie().__('Check your phone')});
        }).catch(function (err) {
            console.log("error: ", err);
            if (err.message) return res.send({status: 'error', message: res.cookie().__(err.message)});
            else return res.send({status: 'error', message: res.cookie().__('Sending SMS is failed')});
        });
    },
    postVerifyPhoneCode: async function (req, res, next) {
        if (!req.session.user) return res.send({status: 'error', message: res.cookie().__('Unknown user')});
        let user = await UserModel.findOne({id: req.session.user.id});
        if (!user) return res.send({status: 'error', message: res.cookie().__('Unknown user')});
        let phone = req.body.phone_number;
        let code = req.body.phone_code;
        console.log(phone, code);
        let regex = /^\d+$/;
        if (!regex.test(phone)) return res.send({status: 'error', message: res.cookie().__('Phone number format is not valid')});
        if (req.session.user.phone_verify_token !== code) return res.send({status: 'error', message: res.cookie().__('Code is not valid')});
        await user.updateOne({phone_verify_flag: 2});
        req.session.login = 1;
        req.session.user.phone_verify_flag = 2;
        req.session.user.phone_verify_token = null;
        req.session.save();
        return res.send({status: 'success', message: res.cookie().__('Phone verification is success')});
    }
});
