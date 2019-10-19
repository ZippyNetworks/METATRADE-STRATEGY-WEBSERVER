let BaseController = require('./BaseController.js');
module.exports = {
    name: 'MiddlewareController',
    m_checkLogin: function (req, res, next) {
        if (req.session.login === 1 && req.session.user) next();
        else {
            req.session.login = 0;
            req.session.user = null;
            res.redirect('/auth/login');
        }
    },
    m_checkLoginPost: function (req, res, next) {
        if (req.session.login === 1 && req.session.user) next();
        else {
            req.session.login = 0;
            req.session.user = null;
            res.send({status: 'error', message: res.cookie().__('You are not logged in')});
        }
    },

    m_checkManageUserAdmin: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(1) > -1) next();
        else res.redirect('/404');
    },
    m_checkManageUserAdminPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(1) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkManageGroup: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(2) > -1) next();
        else res.redirect('/404');
    },
    m_checkManageGroupPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(2) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkManageMTAccount: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(3) > -1) next();
        else res.redirect('/404');
    },
    m_checkManageMTAccountPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(3) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkAddEditMTAccount: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(4) > -1) next();
        else res.redirect('/404');
    },
    m_checkAddEditMTAccountPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(4) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkManageChampionship: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(5) > -1) next();
        else res.redirect('/404');
    },
    m_checkManageChampionshipPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(5) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkAttendChampion: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(6) > -1) next();
        else res.redirect('/404');
    },
    m_checkAttendChampionPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(6) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkSeeStatistic: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(7) > -1) next();
        else res.redirect('/404');
    },
    m_checkSeeStatisticPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(7) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkManagePlan: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(8) > -1) next();
        else res.redirect('/404');
    },
    m_checkManagePlanPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(8) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkManageBroker: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(9) > -1) next();
        else res.redirect('/404');
    },
    m_checkManageBrokerPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(9) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkManageNJ4X: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(10) > -1) next();
        else res.redirect('/404');
    },
    m_checkManageNJ4XPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(10) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkSeeBackup: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(11) > -1) next();
        else res.redirect('/404');
    },
    m_checkSeeBackupPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(11) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkSeeLogs: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(12) > -1) next();
        else res.redirect('/404');
    },
    m_checkSeeLogsPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(12) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkSeeFinantial: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(13) > -1) next();
        else res.redirect('/404');
    },
    m_checkSeeFinantialPost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(13) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkPostAdminMessage: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(14) > -1) next();
        else res.redirect('/404');
    },
    m_checkPostAdminMessagePost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(14) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },

    m_checkSendMessage: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(15) > -1) next();
        else res.redirect('/404');
    },
    m_checkSendMessagePost: function (req, res, next) {
        let group = req.session.group;
        if (group && group.permissions && group.permissions.indexOf(15) > -1) next();
        else res.send({status: 'error', message: res.cookie().__('Access is undefined')});
    },
};
