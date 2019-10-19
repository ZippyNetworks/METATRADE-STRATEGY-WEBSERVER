let View = require('../views/base');
let path = require('path');
let fs = require('fs');
let nodemailer = require('nodemailer');
let config = require('../config/index')();
let transporter = nodemailer.createTransport({
    host: config.mail_info.host,
    port: 587,
    secure: false,
    auth: {
        user: config.mail_info.user,
        pass: config.mail_info.password
    }
});
let ejs = require('ejs');
let speakeasy = require('speakeasy');

let BaseController = require('./BaseController');
let UserModel = require('../models/user_ms/UserModel');
let GroupModel = require('../models/user_ms/GroupModel');
let PermissionModel = require('../models/user_ms/PermissionModel');
//let BookmarkModel = require('../models/user_ms/BookmarkModel');
let NotificationModel = require('../models/user_ms/NotificationModel');
let PaymentModel = require('../models/user_ms/PaymentModel');
let AdminMessageModel = require('../models/common_ms/AdminMessageModel');

let CurrencyPairModel = require('../models/business_ms/CurrencyPair');
let ApprovalPlanModel = require('../models/business_ms/ApprovalPlanModel');
let PlanModel = require('../models/business_ms/PlanModel');
let ServerBrokerModel = require('../models/business_ms/ServerBrokerModel');
let NJ4XServerModel = require('../models/business_ms/NJ4XServerModel');
let MTAccountModel = require('../models/business_ms/MTAccountModel');
let Nj4xLogModel = require('../models/business_ms/Nj4xLogModel');
let AccountLogModel = require('../models/business_ms/AccountLogModel');

///////////////////////// SOCKET-CLIENT ///////////////////////////
let socket = require('socket.io-client')('http://localhost:3333');
socket.on('connect', function(){
    console.log("*** Connection is Established! ***");
});

socket.on('disconnect', function(){
    console.log("*** Disconnected! ***")
});

socket.on('requestSync', async function (msg) {
    console.log("### RequestSync Received! ###\n");
    let nj4x_servers = await NJ4XServerModel.find({});
    socket.emit("syncServerSettingWithNj4x", nj4x_servers);
    let mt_accounts = await MTAccountModel.find({});
    socket.emit("syncEASettingWithNj4x", mt_accounts);
});
/////////////////////////////////////////////////////////////////////

module.exports = BaseController.extend({
    name: 'UserController',
    manage_groups: async function (req, res, next) {
        let user = req.session.user;
        let permissions = await PermissionModel.find({});
        let groups = await GroupModel.find({role: {$ne: 0}}).sort({role: 1});
        let v = new View(res, 'user_vs/groups');
        v.render({
            title: 'Boom Invest S/A|Groups',
            session: req.session,
            i18n: res,
            tab_text: 'user_management',
            sub_text: 'user_groups',
            user: user,
            permissions: permissions,
            groups: groups,
        })
    },
    addNewGroup: async function (req, res, next) {
        let group_name = req.body.group_name;
        if (group_name === '') return res.send({status: 'error', message: res.cookie().__('Group name is empty')});
        let check_group_name = await GroupModel.findOne({name: group_name});
        if (check_group_name) return res.send({status: 'error', message: res.cookie().__('Group name exist already')});
        let permissions = req.body.permissions;
        let group_len = await GroupModel.find({}).countDocuments();
        let new_group = GroupModel({
            name: group_name,
            permissions: permissions,
            sql_id: group_len,
            role: group_len
        });
        await new_group.save();
        return res.send({status: 'success', message: res.cookie().__('Adding success')});
    },
    editGroup: async function (req, res, next) {
        let group_id = req.body.group_id;
        let permissions = [];
        if (req.body.permissions)
            permissions = req.body.permissions.map(function(item) {
                return parseInt(item, 10);
            });

        let group = await GroupModel.findOne({id: group_id});
        if (!group) return res.send({status: 'error', message: res.cookie().__('Not found group')});
        await group.updateOne({permissions: permissions});
        return res.send({status: 'success', message: res.cookie().__('Editing success')});
    },
    // manage_bookmarks: async function (req, res, next) {
    //     let user = req.session.user;
    //     let permissions = await PermissionModel.find({});
    //     let bookmarks = await BookmarkModel.find({});
    //     let v = new View(res, 'user_vs/bookmarks');
    //     v.render({
    //         title: 'Boom Invest S/A|Roles',
    //         session: req.session,
    //         i18n: res,
    //         tab_text: 'user_management',
    //         sub_text: 'user_bookmarks',
    //         user: user,
    //         permissions: permissions,
    //         bookmarks: bookmarks
    //     })
    // },
    // addNewBookmark: async function (req, res, next) {
    //     let bookmark_name = req.body.bookmark_name;
    //     if (bookmark_name === '') return res.send({status: 'error', message: res.cookie().__('Bookmark name is empty')});
    //     let check_bookmark_name = await BookmarkModel.findOne({name: bookmark_name});
    //     if (check_bookmark_name) return res.send({status: 'error', message: res.cookie().__('Bookmark name exist already')});
    //     let permissions = req.body.permissions;
    //     let bookmark_len = await BookmarkModel.find({}).countDocuments();
    //     let new_bookmark = BookmarkModel({
    //         name: bookmark_name,
    //         permissions: permissions,
    //         sql_id: bookmark_len
    //     });
    //     await new_bookmark.save();
    //     return res.send({status: 'success', message: res.cookie().__('Adding success')});
    // },
    // editBookmark: async function (req, res, next) {
    //     let bookmark_id = req.body.bookmark_id;
    //     let permissions = req.body.permissions.map(function(item) {
    //         return parseInt(item, 10);
    //     });
    //     let bookmark = await BookmarkModel.findOne({id: bookmark_id});
    //     if (!bookmark) return res.send({status: 'error', message: res.cookie().__('Not found bookmark')});
    //     await bookmark.updateOne({permissions: permissions});
    //     return res.send({status: 'success', message: res.cookie().__('Editing success')});
    // },
    manage_users: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        req.session.user = user;
        let users = await UserModel.find({email: {$ne: config.dev_info.email}});
        let groups = await GroupModel.find({role: {$ne: 0}});
        let v = new View(res, 'user_vs/users');
        v.render({
            title: 'Boom Invest S/A|Users',
            session: req.session,
            i18n: res,
            tab_text: 'user_management',
            sub_text: 'user_users',
            user: user,
            users: users,
            groups: groups
        })
    },
    editUser: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.body.user_id});
        let group = await GroupModel.findOne({id: req.body.group_id});
        if (!user) return res.send({status: 'error', message: res.cookie().__('Undefined user')});
        if (!group) return res.send({status: 'error', message: res.cookie().__('Undefined group')});
        await user.updateOne({group_id: group.id});
        return res.send({status: 'success', message: res.cookie().__('Updated user successfully')});
    },
    account_settings: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let notifications = await NotificationModel.findOne({user_id: user.id});
        let payments = await PaymentModel.findOne({user_id: user.id});
        if (!notifications) {
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
            notifications = await new_notification.save();
        }
        if (!payments) {
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
            payments = await new_payments.save();
        }
        req.session.notifications = notifications;
        req.session.payments = payments;
        let v = new View(res, 'settings/account_settings');
        v.render({
            title: 'Boom Invest S/A|Profile',
            session: req.session,
            i18n: res,
            tab_text: 'settings',
            sub_text: 'settings_profile',
            user: user,
            notifications: notifications,
            payments: payments,
        })
    },
    google_auth_switch: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        if (!user) return res.send({status: 'error', message: res.cookie().__("Unknown user")});
        let token_verified = speakeasy.totp.verify({
            secret: user.factor2,
            encoding: 'base32',
            token: req.body.factor2_code
        });
        if (!token_verified) return res.send({status: 'error', message: res.cookie().__('Google Authenticated Token is incorrect')});
        let factor2_flag = parseInt(req.body.factor2_flag);
        await user.updateOne({factor2_flag: factor2_flag});
        req.session.user.factor2_flag = factor2_flag;
        if (factor2_flag === 1) return res.send({status: 'success', message: res.cookie().__('Your 2FA is activated')});
        else return res.send({status: 'success', message: res.cookie().__('Your 2FA is disabled')});
    },
    editProfile: async function (req, res, next) {
        let first_name = req.body.first_name, last_name = req.body.last_name, email = req.body.email,
            old_password = req.body.old_password, new_password = req.body.new_password;
        let user = await UserModel.findOne({id: req.session.user.id});
        if (user.email !== email) return res.send({status: 'error', message: res.cookie().__('Undefined user')});
        if (!user.verifyPassword(old_password)) return res.send({status: 'error', message: res.cookie().__('Old password is not correct')});
        user.first_name = first_name;
        user.last_name = last_name;
        user.password = new_password;
        await user.save();
        req.session.user = user;
        return res.send({status: 'success', message: res.cookie().__('Updated user profile successfully')});
    },
    changeAvatar: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let avatarPath = user.avatar;
        if (req.body.avatarImg.length > 1000) {
            let avatarData = req.body.avatarImg.replace(/^data:image\/\w+;base64,/, "");
            let file_extension = '.png';
            if (avatarData.charAt(0) === '/') file_extension = '.jpg';
            else if (avatarData.charAt(0) === 'R') file_extension = '.gif';
            let public_path = path.resolve('public');
            avatarPath = '/avatars/avatar_' + user.id + file_extension;
            let avatarUploadPath = path.resolve('public') + avatarPath;
            fs.writeFileSync(avatarUploadPath, avatarData, 'base64');
        }
        await user.updateOne({avatar: avatarPath});
        req.session.user.avatar = avatarPath;
        return res.send({status: 'success', message: res.cookie().__('Changed avatar successfully'), avatarPath: avatarPath});
    },

    notifications: async function (req, res, next) {
        let notifications = await NotificationModel.findOne({user_id: req.session.user.id});
        if (!notifications) return res.send({status: 'error', message: res.cookie().__('Unknown user')});
        let value = (req.body.value === 'true');
        switch (req.body.category) {
            case 'email':
                if (req.body.name === 'order') await notifications.updateOne({'email.order': value});
                else if (req.body.name === 'message') await notifications.updateOne({'email.message': value});
                else if (req.body.name === 'day') await notifications.updateOne({'email.day': value});
                else if (req.body.name === 'week') await notifications.updateOne({'email.week': value});
                else if (req.body.name === 'month') await notifications.updateOne({'email.month': value});
                else if (req.body.name === 'year') await notifications.updateOne({'email.year': value});
                break;
            case 'sms':
                if (req.body.name === 'earnings') await notifications.updateOne({'sms.earnings': value});
                else if (req.body.name === 'week') await notifications.updateOne({'sms.week': value});
                else if (req.body.name === 'month') await notifications.updateOne({'sms.month': value});
                else if (req.body.name === 'year') await notifications.updateOne({'sms.year': value});
                break;
            case 'browser':
                if (req.body.name === 'order') await notifications.updateOne({'browser.order': value});
                else if (req.body.name === 'message') await notifications.updateOne({'browser.message': value});
                break;
            default:
                break;
        }
        req.session.notifications = await NotificationModel.findOne({id: notifications.id});
        return res.send({status: 'success', message: res.cookie().__('Updated success')})
    },
    payment_methods: async function (req, res, next) {
        let user = req.session.user;
        let payment = await PaymentModel.findOne({user_id: user.id});
        if (!user || !payment) return res.send({status: 'error', message: res.cookie().__('Undefined user')});
        let type = req.body.type;
        let sub_type = req.body.sub_type;
        if (sub_type === 'confirm') {
            let email = req.body.email;
            if (user.email !== email) return res.send({status: 'error', message: res.cookie().__('Email is not valid')});
            let account_number = req.body.account_number;
            let verify_code =  Math.floor(10000 + Math.random() * 90000).toString();
            let html = '<h5>' + res.cookie().__("Confirm email for Account Number") + ': ' + verify_code + '</h5>'
            let mailOpts = {
                from: 'ECAT Manager',
                to: email,
                subject: 'Notification center',
                html: html
            };
            transporter.sendMail(mailOpts, async (err, info) => {
                if (err) {
                    console.log('[' + new Date() + ']', "MAIL SENDING ERROR", err);
                    return res.send({status: 'fail', message: res.cookie().__('Email sending failed')});
                }
                console.log('[' + new Date() + '] Mail sending success ', JSON.stringify(info));
                req.session.ecat_bank_payment = {
                    email: email,
                    account_number: account_number,
                    verify_code: verify_code
                };
                console.log(req.session.ecat_bank_payment);
                return res.send({status: 'success', message: res.cookie().__('Please check your email')});
            });
        } else if (sub_type === 'code') {
            let confirm_code = req.body.confirm_code;
            if (!req.session.ecat_bank_payment || req.session.ecat_bank_payment.verify_code !== confirm_code)
                return res.send({status: 'error', message: res.cookie().__('Confirm code is not valid')});
            switch (type) {
                case 'BANK':
                    payment.BANK_address = req.session.ecat_bank_payment.account_number;
                    break;
                case 'BTC':
                    payment.BTC_address = req.session.ecat_bank_payment.account_number;
                    break;
                case 'ETH':
                    payment.ETH_address = req.session.ecat_bank_payment.account_number;
                    break;
                case 'GECA':
                    payment.GECA_address = req.session.ecat_bank_payment.account_number;
                    break;
                case 'CCC':
                    payment.CCC_address = req.session.ecat_bank_payment.account_number;
                    break;
                default:
                    break;
            }
            await payment.save();
            let account_num = req.session.ecat_bank_payment.account_number;
            req.session.ecat_bank_payment = null;
            return res.send({status: 'success', message: res.cookie().__('Added account number successfully'), account_num: account_num});
        }
    },
    adminMessages: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        if (!user) return res.redirect('404');
        let admin_messages = await AdminMessageModel.find({});
        let v = new View(res, 'common_vs/admin_messages');
        v.render({
            title: 'Boom Invest S/A|Groups',
            session: req.session,
            i18n: res,
            tab_text: 'admin_messages',
            sub_text: '',
            user: user,
            admin_messages: admin_messages,
        })
    },
    postAdminMessages: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let subject = req.body.subject;
        let content = req.body.content;
        let new_admin_message = new AdminMessageModel({
            user_id: user.id,
            subject: subject,
            content: content,
            created_at: new Date(),
        });
        await new_admin_message.save();
        return res.send({status: 'success', message: res.cookie().__('Post Message Successfully')});
    },
    editAdminMessages: async function (req, res, next) {
        let message_id = req.body.message_id;
        let message = await AdminMessageModel.findOne({id: message_id});
        if (!message) return res.send({status: 'error', message: res.cookie().__('The message is not valid')});
        let type = req.body.type;
        if (type === 'edit') {
            message.subject = req.body.message_subject;
            message.content = req.body.message_content;
            await message.save();
            return res.send({status: 'success', message: res.cookie().__('Edited a message Successfully')});
        } else if (type === 'delete') {
            await message.remove();
            return res.send({status: 'success', message: res.cookie().__('Removed a message Successfully')});
        } else if (type === 'get') {
            return res.send({status: 'success', message: res.cookie().__('Getting is success'), data: message});
        } else {
            return res.send({status: 'error', message: res.cookie().__('The action is not valid')});
        }
    },

    //Business Settings
    championship_Settings: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let v = new View(res, 'settings/championship_settings');
        v.render({
            title: 'Boom Invest S/A|Championship Settings',
            session: req.session,
            i18n: res,
            tab_text: 'business_settings',
            sub_text: 'champion_setting',
            user: user,
        })
    },
    outcontrol_Settings: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let nj4x_servers = await NJ4XServerModel.find({});
        let nj4x_logs = await Nj4xLogModel.find({});
        let v = new View(res, 'settings/outcontrol_settings');
        v.render({
            title: 'Boom Invest S/A|OutControl Settings',
            session: req.session,
            i18n: res,
            tab_text: 'business_settings',
            sub_text: 'outcontrol_setting',
            user: user,
            nj4x_servers: nj4x_servers,
            nj4x_logs: nj4x_logs,
        })
    },
    server_Broker_Settings: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let brokers = await ServerBrokerModel.find({});

        let v = new View(res, 'settings/server_broker_settings');
        v.render({
            title: 'Boom Invest S/A|Server Broker Settings',
            session: req.session,
            i18n: res,
            tab_text: 'business_settings',
            sub_text: 'server_brokers',
            user: user,
            brokers: brokers,
        })
    },
    plan_Settings: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let currencypairs = await CurrencyPairModel.find({});
        let ApprovalPlans = await ApprovalPlanModel.find({});
        let plans = await PlanModel.find({});
        let v = new View(res, 'settings/plan_settings');
        v.render({
            title: 'Boom Invest S/A|Plan Settings',
            session: req.session,
            i18n: res,
            tab_text: 'business_settings',
            sub_text: 'plans',
            user: user,
            plans: plans,
            ApprovalPlans: ApprovalPlans,
            currencypairs: currencypairs,
        })
    },
    ea_Settings: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let users = await UserModel.find({});
        let mt_accounts = await MTAccountModel.find({});
        let currency_pairs = await CurrencyPairModel.find({});
        let nj4x_servers = await NJ4XServerModel.find({});
        let approval_plans = await ApprovalPlanModel.find({});
        let v = new View(res, 'settings/ea_settings');
        v.render({
            title: 'Boom Invest S/A|EA Settings',
            session: req.session,
            i18n: res,
            tab_text: 'business_settings',
            sub_text: 'ea_setting',
            user: user,
            users: users,
            currency_pairs: currency_pairs,
            nj4x_servers: nj4x_servers,
            approval_plans: approval_plans,
            mt_accounts: mt_accounts,
        })
    },
    ///
    statisticTrader: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let v = new View(res, 'user_vs/statistic_trader');
        v.render({
            title: 'Boom Invest S/A|Statistic Trader',
            session: req.session,
            i18n: res,
            tab_text: 'system_management',
            sub_text: 'statistic_trader',
            user: user,
        })
    },
    finantialArea: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let v = new View(res, 'user_vs/finantial_area');
        v.render({
            title: 'Boom Invest S/A|Finantial Area',
            session: req.session,
            i18n: res,
            tab_text: 'system_management',
            sub_text: 'finantial_area',
            user: user,
        })
    },
    backupSystem: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let v = new View(res, 'user_vs/backup_system');
        v.render({
            title: 'Boom Invest S/A|Backup System',
            session: req.session,
            i18n: res,
            tab_text: 'system_management',
            sub_text: 'backup_system',
            user: user,
        })
    },
    logSystem: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        let v = new View(res, 'user_vs/log_system');
        v.render({
            title: 'Boom Invest S/A|Log System',
            session: req.session,
            i18n: res,
            tab_text: 'system_management',
            sub_text: 'logs_system',
            user: user,
        })
    },

    editPlan: async function (req, res, next) {
        let edit_type = req.body.type;

        let new_normal_name                  = req.body.new_normal_name;
        let new_normal_price                 = req.body.new_normal_price;
        let new_normal_min_lot               = req.body.new_normal_min_lot;
        let new_normal_max_lot               = req.body.new_normal_max_lot;
        let new_normal_max_daily_profit      = req.body.new_normal_max_daily_profit;
        let new_normal_max_daily_loss        = req.body.new_normal_max_daily_loss;
        let new_normal_daily_loss_fix        = req.body.new_normal_daily_loss_fix;
        let new_normal_max_total_profit      = req.body.new_normal_max_total_profit;
        let new_normal_max_total_loss        = req.body.new_normal_max_total_loss;
        let new_normal_total_loss_fix        = req.body.new_normal_total_loss_fix;
        let new_normal_max_orders            = req.body.new_normal_max_orders;
        let new_normal_comment               = req.body.new_normal_comment;
        let new_normal_pairs                 = req.body.new_normal_pairs;
        let new_normal_use_pre_approval      = req.body.new_normal_use_pre_approval;
        let new_normal_usd_for_pre_approval  = req.body.new_normal_usd_for_pre_approval;
        let new_normal_approval_plan         = req.body.new_normal_approval_plan;
        let new_normal_validity_period       = req.body.new_normal_validity_period;
        let new_normal_outside_control_flag  = req.body.new_normal_outside_control_flag;

        if (edit_type == "add") {
            let new_plan = new PlanModel({
                name:new_normal_name                ,
                price:new_normal_price               ,
                min_lot:new_normal_min_lot             ,
                max_lot:new_normal_max_lot             ,
                max_daily_profit:new_normal_max_daily_profit    ,
                max_daily_loss:new_normal_max_daily_loss      ,
                daily_loss_fix:(new_normal_daily_loss_fix == 'true')    ,
                max_total_profit:new_normal_max_total_profit    ,
                max_total_loss:new_normal_max_total_loss      ,
                total_loss_fix:(new_normal_total_loss_fix == 'true')      ,
                max_orders:new_normal_max_orders          ,
                comment:new_normal_comment             ,
                currency_pair:new_normal_pairs               ,
                use_pre_approval:(new_normal_use_pre_approval == 'true')   ,
                usd_for_pre_approval:new_normal_usd_for_pre_approval,
                approval_plan_id:new_normal_approval_plan       ,
                validity_period:new_normal_validity_period     ,
                outside_control_flag:(new_normal_outside_control_flag == 'true'),
            });
            await new_plan.save();
            return res.send({
                status: 'success',
                new_normal_plan: new_plan,
                message: res.cookie().__('Added New Plan Successfully')
            });
        }
        if ( edit_type == "edit" ){
            let normal_planid = req.body.normal_planid;
            let normal_plan = await PlanModel.findOne({id: normal_planid});
            if (!normal_plan) return res.send({status: 'error', message: res.cookie().__('The Plan is not valid')});

                normal_plan.name=new_normal_name                ;
                normal_plan.price=new_normal_price               ;
                normal_plan.min_lot=new_normal_min_lot             ;
                normal_plan.max_lot=new_normal_max_lot             ;
                normal_plan.max_daily_profit=new_normal_max_daily_profit    ;
                normal_plan.max_daily_loss=new_normal_max_daily_loss      ;
                normal_plan.daily_loss_fix=(new_normal_daily_loss_fix == 'true')    ;
                normal_plan.max_total_profit=new_normal_max_total_profit    ;
                normal_plan.max_total_loss=new_normal_max_total_loss      ;
                normal_plan.total_loss_fix=(new_normal_total_loss_fix == 'true')      ;
                normal_plan.max_orders=new_normal_max_orders          ;
                normal_plan.comment=new_normal_comment             ;
                normal_plan.currency_pair=new_normal_pairs               ;
                normal_plan.use_pre_approval=(new_normal_use_pre_approval == 'true')   ;
                normal_plan.usd_for_pre_approval=new_normal_usd_for_pre_approval;
                normal_plan.approval_plan_id=new_normal_approval_plan       ;
                normal_plan.validity_period=new_normal_validity_period     ;
                normal_plan.outside_control_flag=(new_normal_outside_control_flag == 'true');

            await normal_plan.save();
            return res.send({
                status: 'success',
                edit_plan: normal_plan,
                message: res.cookie().__('Changed Plan Successfully')
            });
        }
        if ( edit_type == "delete" ) {
            let normal_planid = req.body.normal_planid;
            let normal_plan = await PlanModel.findOne({id: normal_planid});
            if (!normal_plan) return res.send({status: 'error', message: res.cookie().__('The Plan is not valid')});
            await normal_plan.remove();
            return res.send({status: 'success', message: res.cookie().__('Removed a Plan Successfully')});
        }
    },
    editApprovalPlan: async function (req, res, next) {
        let edit_type = req.body.type;

        let new_approval_name = req.body.new_approval_name;
        let new_approval_min_lot = req.body.new_approval_min_lot;
        let new_approval_max_lot = req.body.new_approval_max_lot;
        let new_approval_daily_profit = req.body.new_approval_daily_profit;
        let new_approval_daily_loss = req.body.new_approval_daily_loss;
        let new_approval_max_total_profit = req.body.new_approval_max_total_profit;
        let new_approval_max_total_loss = req.body.new_approval_max_total_loss;
        let new_approval_max_orders = req.body.new_approval_max_orders;
        let new_approval_comment = req.body.new_approval_comment;
        let new_approval_pairs = req.body.new_approval_pairs;

        if (edit_type == "add") {
            let new_approval_plan = new ApprovalPlanModel({
                name: new_approval_name,
                min_lot: new_approval_min_lot,
                max_lot: new_approval_max_lot,
                max_daily_profit: new_approval_daily_profit,
                max_daily_loss: new_approval_daily_loss,
                max_total_profit: new_approval_max_total_profit,
                max_total_loss: new_approval_max_total_loss,
                max_orders: new_approval_max_orders,
                comment: new_approval_comment,
                currency_pair: new_approval_pairs,
            });
            await new_approval_plan.save();
            return res.send({
                status: 'success',
                new_approval_plan: new_approval_plan,
                message: res.cookie().__('Added New Approval Plan Successfully')
            });
        }
        if ( edit_type == "edit" ){
            let approval_planid = req.body.approval_planid;
            let approval_plan = await ApprovalPlanModel.findOne({id: approval_planid});
            if (!approval_plan) return res.send({status: 'error', message: res.cookie().__('The Approval Plan is not valid')});
            approval_plan.name = new_approval_name;
            approval_plan.min_lot = new_approval_min_lot;
            approval_plan.max_lot = new_approval_max_lot;
            approval_plan.max_daily_profit = new_approval_daily_profit;
            approval_plan.max_daily_loss = new_approval_daily_loss;
            approval_plan.max_total_profit = new_approval_max_total_profit;
            approval_plan.max_total_loss = new_approval_max_total_loss;
            approval_plan.max_orders = new_approval_max_orders;
            approval_plan.comment = new_approval_comment;
            approval_plan.currency_pair = new_approval_pairs;
            await approval_plan.save();
            return res.send({
                status: 'success',
                edit_approval_plan: approval_plan,
                message: res.cookie().__('Changed Approval Plan Successfully')
            });
        }
        if ( edit_type == "delete" ) {
            let approval_planid = req.body.approval_planid;
            let approval_plan = await ApprovalPlanModel.findOne({id: approval_planid});
            if (!approval_plan) return res.send({status: 'error', message: res.cookie().__('The Approval Plan is not valid')});
            await approval_plan.remove();
            return res.send({status: 'success', message: res.cookie().__('Removed a Approval Plan Successfully')});
        }
    },
    editCurrencyPair: async function (req, res, next) {
        let edit_type = req.body.type;
        if (edit_type == "add") {
            let new_pair = req.body.currency_pair;
            let currencypair = new CurrencyPairModel({
                name: new_pair,
            });
            await currencypair.save();
            return res.send({
                status: 'success',
                new_pair: currencypair,
                message: res.cookie().__('Added New Currency Pairs Successfully')
            });
        } else if ( edit_type == "delete" ) {
            let pair_id = req.body.currency_pairid;
            let currencypair = await CurrencyPairModel.findOne({id: pair_id});
            if (!currencypair) return res.send({status: 'error', message: res.cookie().__('The Currency Pair is not valid')});
            await currencypair.remove();
            return res.send({status: 'success', message: res.cookie().__('Removed a Currency Pair Successfully')});
        }
    },

    editServerBroker: async function (req, res, next) {
        let edit_type = req.body.type;
        if (edit_type == "add") {
            let server_broker_name = req.body.server_broker_name;
            let server_broker_ip = req.body.server_broker_ip;
            let new_server_broker = new ServerBrokerModel({
                server_name: server_broker_name,
                server_ip: server_broker_ip,
            });
            await new_server_broker.save();
            return res.send({
                status: 'success',
                new_server_broker: new_server_broker,
                message: res.cookie().__('Added New Server Broker Successfully')
            });
        } else if ( edit_type == "delete" ) {
            let server_broker_id = req.body.server_broker_id;
            let server_broker = await ServerBrokerModel.findOne({id: server_broker_id});
            if (!server_broker) return res.send({status: 'error', message: res.cookie().__('The Server Broker is not valid')});
            await server_broker.remove();
            return res.send({status: 'success', message: res.cookie().__('Removed a Server Broker Successfully')});
        }
    },

    editNJ4XServer: async function (req, res, next) {
        let edit_type = req.body.type;
        if (edit_type == "add") {
            let nj4x_server_name = req.body.nj4x_server_name;
            let nj4x_server_ip = req.body.nj4x_server_ip;
            let nj4x_server_port = req.body.nj4x_server_port;
            let max_terminals = req.body.max_terminals;
            let time_sync = req.body.time_sync;
            let status = "Disconnected";
            let new_server = new NJ4XServerModel({
                name: nj4x_server_name,
                server_ip: nj4x_server_ip,
                server_port: nj4x_server_port,
                max_terminals: max_terminals,
                time_sync: time_sync,
                status: status,

            });
            await new_server.save();
            return res.send({
                status: 'success',
                new_server: new_server,
                message: res.cookie().__('Added New Server Successfully')
            });
        } else if ( edit_type == "delete" ) {
            let server_id = req.body.server_id;
            let server = await NJ4XServerModel.findOne({id: server_id});
            if (!server) return res.send({status: 'error', message: res.cookie().__('The Server is not valid')});
            await server.remove();
            return res.send({status: 'success', message: res.cookie().__('Removed a Server Successfully')});
        }
    },
    editMTAccount: async function (req, res, next) {
        let edit_type = req.body.type;
        let mt_account = await MTAccountModel.findOne({id: req.body.account_id});
        if (!mt_account) return res.send({status: 'error', message: res.cookie().__('The MetaTrader Account is not valid')});

        if (edit_type == "Edit") {
            let nj4x_server_id       = req.body.nj4x_server_id;
            let plan_name            = req.body.plan_name;
            let plan_price           = req.body.plan_price;
            let min_lot              = req.body.min_lot;
            let max_lot              = req.body.max_lot;
            let max_daily_profit     = req.body.max_daily_profit;
            let max_daily_loss       = req.body.max_daily_loss;
            let daily_loss_fix       = req.body.daily_loss_fix;
            let max_total_profit     = req.body.max_total_profit;
            let max_total_loss       = req.body.max_total_loss;
            let total_loss_fix       = req.body.total_loss_fix;
            let max_orders           = req.body.max_orders;
            let comment              = req.body.comment;
            let pairs                = req.body.pairs;
            let use_pre_approval     = req.body.use_pre_approval;
            let usd_for_pre_approval = req.body.usd_for_pre_approval;
            let approval_plan        = req.body.approval_plan;
            let validity_period      = req.body.validity_period;
            let outside_control_flag = req.body.outside_control_flag;

            let new_plan = {
                name : plan_name           ,
                price : plan_price          ,
                min_lot : min_lot             ,
                max_lot : max_lot             ,
                max_daily_profit : max_daily_profit    ,
                max_daily_loss : max_daily_loss      ,
                daily_loss_fix : (daily_loss_fix == 'true')   ,
                max_total_profit : max_total_profit    ,
                max_total_loss : max_total_loss      ,
                total_loss_fix : (total_loss_fix  == 'true')     ,
                max_orders : max_orders          ,
                comment : comment             ,
                currency_pair : pairs               ,
                use_pre_approval : (use_pre_approval  == 'true')   ,
                usd_for_pre_approval : usd_for_pre_approval,
                approval_plan_id : approval_plan       ,
                validity_period : validity_period     ,
                outside_control_flag : (outside_control_flag  == 'true'),
            };
            mt_account.server_id = nj4x_server_id;
            // mt_account.plan.name = plan_name           ;
            // mt_account.plan.price = plan_price          ;
            // mt_account.plan.min_lot = min_lot             ;
            // mt_account.plan.max_lot = max_lot             ;
            // mt_account.plan.max_daily_profit = max_daily_profit    ;
            // mt_account.plan.max_daily_loss = max_daily_loss      ;
            // mt_account.plan.daily_loss_fix = (daily_loss_fix == 'true')   ;
            // mt_account.plan.max_total_profit = max_total_profit    ;
            // mt_account.plan.max_total_loss = max_total_loss      ;
            // mt_account.plan.total_loss_fix = (total_loss_fix  == 'true')     ;
            // mt_account.plan.max_orders = max_orders          ;
            // mt_account.plan.comment = comment             ;
            // mt_account.plan.currency_pair = pairs               ;
            // mt_account.plan.use_pre_approval = (use_pre_approval  == 'true')   ;
            // mt_account.plan.usd_for_pre_approval = usd_for_pre_approval;
            // mt_account.plan.approval_plan_id = approval_plan       ;
            // mt_account.plan.validity_period = validity_period     ;
            // mt_account.plan.outside_control_flag = (outside_control_flag  == 'true');
            mt_account.plan = new_plan;
            console.log(mt_account);
            await mt_account.save();
            return res.send({status: 'success', message: res.cookie().__('Changed a Account Successfully')});

        } else if ( edit_type == "Aprove" ) {
            mt_account.status = "Aproved";
            mt_account.save();
            return res.send({status: 'success', message: res.cookie().__('Aproved a Account Successfully')});
        } else if (edit_type == "Block") {
            mt_account.status = "Blocked";
            mt_account.save();
            return res.send({status: 'success', message: res.cookie().__('Blocked a Account Successfully')});
        } else if (edit_type == "Remove") {
            mt_account.remove();
            return res.send({status: 'success', message: res.cookie().__('Removed a Account Successfully')});
        }
    },
    syncEASettingWithNj4x: async function (req, res, next){
        let mt_accounts = await MTAccountModel.find({});
        socket.emit("syncEASettingWithNj4x", mt_accounts);
    },
    syncServerSettingWithNj4x: async function (req, res, next){
        let nj4x_servers = await NJ4XServerModel.find({});
        socket.emit("syncServerSettingWithNj4x", nj4x_servers);
    },
});
