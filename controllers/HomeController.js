let View = require('../views/base');
let path = require('path');
let fs = require('fs');
let crypto = require('crypto');
let ejs = require('ejs');
let dateTime = require('node-datetime');
let config = require('../config/index')();
let config_limit = 500000;
let nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    host: config.mail_info.host,
    port: 587,
    secure: false,
    auth: {
        user: config.mail_info.user,
        pass: config.mail_info.password
    }
});
let BaseController = require('./BaseController');
let UserModel = require('../models/user_ms/UserModel');
let PaymentModel = require('../models/user_ms/PaymentModel');
let MessageModel = require('../models/common_ms/MessageModel');
let AdminMessageModel = require('../models/common_ms/AdminMessageModel');
let MTAccountModel = require('../models/business_ms/MTAccountModel');
let PlanModel = require('../models/business_ms/PlanModel');
let ServerBrokerModel = require('../models/business_ms/ServerBrokerModel');
let AccountLogModel = require('../models/business_ms/AccountLogModel');
let NJ4XServerModel = require('../models/business_ms/NJ4XServerModel');

module.exports = BaseController.extend({
    name: 'HomeController',
    home: async function (req, res, next) {
        let user = req.session.user;
        console.log(req.session.user);
        let adminMessage = await AdminMessageModel.findOne({}, {}, { sort: { 'created_at' : -1 }});
        let v = new View(res, 'common_vs/home');
        v.render({
            title: 'Boom Invest S/A |Home',
            session: req.session,
            i18n: res,
            tab_text: 'home',
            sub_text: '',
            user: user,
            adminMessage: adminMessage
        })
    },
    // orders: async function (req, res, next) {
    //     let user = req.session.user;
    //     let v = new View(res, 'common_vs/orders');
    //     v.render({
    //         title: 'Boom Invest S/A |Order',
    //         session: req.session,
    //         i18n: res,
    //         tab_text: 'orders',
    //         sub_text: '',
    //         user: user,
    //     })
    // },
    messages_func: async function (req, res, next) {
        let user = req.session.user;
        let stores = [];
        await MessageModel.updateMany({message_to: user.email, status: 1}, {$set: {status: 2}});
        let messages = await MessageModel.find({$or: [{message_from: user.email}, {message_to: user.email}]}).sort({created_at: -1}).limit(config_limit);
        let v = new View(res, 'common_vs/messages');
        v.render({
            title: 'Boom Invest S/A |Messages',
            session: req.session,
            i18n: res,
            tab_text: 'messages',
            sub_text: '',
            user: user,
            stores: stores,
            messages: messages,
        })
    },
    postCustomerMessages: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        if (!user) return res.send({status: 'error', message: res.cookie().__('Undefined user')});
        let section = req.body.message_section;
        let subject = req.body.message_subject;
        let content = req.body.message_content;
        let message_from = user.email;
        let message_to = req.body.message_to;
        let new_message = new MessageModel({
            user_id: user.id,
            section: section,
            store_id: user.id,
            subject: subject,
            content: content,
            message_from: message_from,
            message_to: message_to,
            status: 1,
            created_at: new Date()
        });
        let message_item = await new_message.save();
        return res.send({status: 'success', message: res.cookie().__('Sent message successfully'), data: message_item});
    },
    getUnreadMessages: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        if (!user) return res.send({status: 'error', data: []});
        let unreadMessages = await MessageModel.find({message_to: user.email, status: 1});
        return res.send({status: 'success', data: unreadMessages});
    },
    getMessageItem: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        if (!user) return res.send({status: 'error', message: res.cookie().__('Undefined user')});
        let messageItem = await MessageModel.findOne({id: req.body.message_id});
        if (!messageItem) return res.send({status: 'error', message: res.cookie().__('Undefined message')});
        return res.send({status: 'success', message: res.cookie().__('Getting a message is success'), mData: messageItem,
            sDomain: '', sID: '', sEngine: ''});
    },

    metatrader_accounts: async function (req, res, next) {
        let user = req.session.user;
        let mt_accounts = await MTAccountModel.find({user_id: req.session.user.id});
        let plans = await PlanModel.find({});
        let brokers = await ServerBrokerModel.find({});

        let v = new View(res, 'common_vs/metatrader_accounts');
        v.render({
            title: 'Boom Invest S/A |MetaTrader Accounts',
            session: req.session,
            i18n: res,
            tab_text: 'metatrader_accounts',
            sub_text: '',
            user: user,
            mt_accounts: mt_accounts,
            plans: plans,
            brokers: brokers,
        })
    },
    newMTAccount: async function (req, res, next) {
        let user = await UserModel.findOne({id: req.session.user.id});
        if (!user) return res.send({status: 'error', message: res.cookie().__('Undefined user')});
        let account_number = req.body.account_number;
        let account_password = req.body.account_password;
        let platform = req.body.platform;
        let broker = await ServerBrokerModel.findOne({id: req.body.broker_id});
        let plan = await PlanModel.findOne({id: req.body.plan_id});
        let create_date = Date.now();
        let nj4x_server = await NJ4XServerModel.findOne({});
        let server_id = "";
        if (nj4x_server)
            server_id = nj4x_server.id;
        let new_account = new MTAccountModel({
            user_id: user.id,
            account_number: account_number,
            account_password: account_password,
            broker: broker,
            platform: platform,
            plan: plan,
            status: "Waiting",
            server_id: server_id,
            create_date: create_date,
        });

        await new_account.save();
        return res.send({status: 'success', message: res.cookie().__('Add New MetaTrader Account successfully')});
    },
    championship: async function (req, res, next) {
        let user = req.session.user;
        let v = new View(res, 'common_vs/championship');
        v.render({
            title: 'Boom Invest S/A |Championship',
            session: req.session,
            i18n: res,
            tab_text: 'championship',
            sub_text: '',
            user: user,
        })
    },
    performanceMTAccount: async function (req, res, next) {
        let user = req.session.user;
        let account_id = req.query.id;

        let mt_account = await MTAccountModel.findOne({id: account_id});
        if (!mt_account)
        {
            res.writeHead(302, { "Location": "http://" + req.headers['host'] + '/404' });
            return res.end();
        }
        let account_user = await UserModel.findOne({id: mt_account.user_id});
        let account_username = account_user.first_name;
        let account_number = mt_account.account_number;
        let account_broker_name = mt_account.broker? mt_account.broker.server_name : "";
        let account_platform = mt_account.platform;


        let v = new View(res, 'common_vs/performance_mt_account');
        v.render({
            title: 'Boom Invest S/A |MetaTrader Performance Accounts',
            session: req.session,
            i18n: res,
            tab_text: 'metatrader_accounts',
            sub_text: '',
            user: user,
            account_user: account_user,
            account_username: account_username,
            account_number: account_number,
            account_broker_name: account_broker_name,
            account_platform: account_platform,
        })
    },
    logMTAccount: async function (req, res, next) {
        let user = req.session.user;
        let account_id = req.query.id;

        let mt_account = await MTAccountModel.findOne({id: account_id});
        if (!mt_account)
        {
            res.writeHead(302, { "Location": "http://" + req.headers['host'] + '/404' });
            return res.end();
        }
        let account_user = await UserModel.findOne({id: mt_account.user_id});
        let account_username = account_user.first_name;
        let account_number = mt_account.account_number;
        let account_broker_name = mt_account.broker? mt_account.broker.server_name : "";
        let account_platform = mt_account.platform;

        let account_logs = await AccountLogModel.find({account_id: account_id});

        let v = new View(res, 'common_vs/log_mt_account');
        v.render({
            title: 'Boom Invest S/A |MetaTrader Performance Accounts',
            session: req.session,
            i18n: res,
            tab_text: 'metatrader_accounts',
            sub_text: '',
            user: user,
            account_user: account_username,
            account_number: account_number,
            account_broker_name: account_broker_name,
            account_platform: account_platform,
            account_logs: account_logs,
        })
    },
    error: function (req, res, next) {
        let v = new View(res, 'common_vs/error');
        v.render({
            title: 'Boom Invest S/A |Error',
            session: req.session,
            i18n: res,
        })
    }
});
