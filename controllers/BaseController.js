let _ = require("underscore");
let fs = require('fs');
let crypto = require('crypto');
let config = require('../config')();
let nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    host: config.mail_info.host,
    port: 587,
    secure: false, //ssl
    auth: {
        user: config.mail_info.user,
        pass: config.mail_info.password
    }
});
let SMSAPI = require('smsapi');
let smsapi = new SMSAPI();


let PermissionModel = require('../models/user_ms/PermissionModel');
let GroupModel = require('../models/user_ms/GroupModel');
let UserModel = require('../models/user_ms/UserModel');

module.exports = {
    name: "BaseController",
    extend: function (child) {
        return _.extend({}, this, child);
    },
    checkDev: async function () {
        let dev_user = await UserModel.findOne({email: 'dev@dev.com'});
        if (!dev_user) {
            let dev_role = await GroupModel.findOne({role: 0});
            let dev_item = new UserModel({
                first_name: config.dev_info.name,
                last_name: config.dev_info.name,
                email: config.dev_info.email,
                password: config.dev_info.password,
                group_id: dev_role.id,
                online_state: false,
                email_verify_flag: 2,
                phone_verify_flag: 2,
                reset_flag: 2,
            });
            await dev_item.save();
        }
    },
    init_data: async function () {
        let permissions = await PermissionModel.find({});
        if (permissions.length > 0) {} else {
            let init_permissions = config.init_data.permissions;
            let init_groups = config.init_data.groups;
            for (let i = 0; i < init_permissions.length; i++) {
                let permission_item = new PermissionModel({
                    sql_id: init_permissions[i].sql_id,
                    name: init_permissions[i].name,
                    priority: init_permissions[i].priority
                });
                await permission_item.save();
            }
            for (let j = 0; j < init_groups.length; j++) {
                let group_item = new GroupModel({
                    sql_id: init_groups[j].sql_id,
                    name: init_groups[j].name,
                    role: init_groups[j].role,
                    permissions: init_groups[j].permissions
                });
                await group_item.save();
            }
        }
    },
};