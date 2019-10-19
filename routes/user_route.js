let express = require('express');
let router = express.Router();

let middleware_controller = require('../controllers/MiddlewareController');
let user_controller = require('../controllers/UserController');

router.get('/groups',  middleware_controller.m_checkLogin, middleware_controller.m_checkManageGroup, function (req, res, next) {
    user_controller.manage_groups(req, res, next);
});
router.post('/groups/edit', middleware_controller.m_checkLoginPost, middleware_controller.m_checkManageGroupPost, function (req, res, next) {
    user_controller.editGroup(req, res, next);
});
router.post('/groups/add', middleware_controller.m_checkLoginPost, middleware_controller.m_checkManageGroupPost, function (req, res, next) {
    user_controller.addNewGroup(req, res, next);
});

router.get('/users', middleware_controller.m_checkLogin, middleware_controller.m_checkManageUserAdmin, function (req, res, next) {
    user_controller.manage_users(req, res, next);
});
router.post('/users/edit', middleware_controller.m_checkLoginPost, middleware_controller.m_checkManageUserAdminPost, function (req, res, next) {
    user_controller.editUser(req, res, next);
});


router.get('/account-settings', middleware_controller.m_checkLogin, function (req, res, next) {
    user_controller.account_settings(req, res, next);
});
router.post('/change-google-auth-state', middleware_controller.m_checkLoginPost, function (req, res, next) {
    user_controller.google_auth_switch(req, res, next);
});
router.post('/account-settings/edit-profile', middleware_controller.m_checkLoginPost, function (req, res, next) {
    user_controller.editProfile(req, res, next);
});
router.post('/account-settings/change-avatar', middleware_controller.m_checkLoginPost, function (req, res, next) {
    user_controller.changeAvatar(req, res, next);
});
router.post('/account-settings/notifications', middleware_controller.m_checkLoginPost, function (req, res, next) {
    user_controller.notifications(req, res, next);
});
router.post('/payment-methods', middleware_controller.m_checkLoginPost, function (req, res, next) {
    user_controller.payment_methods(req, res, next);
});

router.get('/admin-messages', middleware_controller.m_checkLogin, middleware_controller.m_checkPostAdminMessage, function (req, res, next) {
    user_controller.adminMessages(req, res, next);
});
router.post('/post-admin-messages', middleware_controller.m_checkLoginPost, middleware_controller.m_checkPostAdminMessagePost, function (req, res, next) {
   user_controller.postAdminMessages(req, res, next);
});
router.post('/post-admin-message-edit', middleware_controller.m_checkLoginPost, middleware_controller.m_checkPostAdminMessagePost, function (req, res, next) {
    user_controller.editAdminMessages(req, res, next);
});
router.post('/get-admin-message', middleware_controller.m_checkLoginPost, middleware_controller.m_checkPostAdminMessage, function (req, res, next) {
    user_controller.editAdminMessages(req, res, next);
});

///Business Settings

router.get('/outcontrol-setting', middleware_controller.m_checkLogin, middleware_controller.m_checkManageNJ4X, function (req, res, next) {
    user_controller.outcontrol_Settings(req, res, next);
});
router.get('/server-brokers', middleware_controller.m_checkLogin, middleware_controller.m_checkManageBroker, function (req, res, next) {
    user_controller.server_Broker_Settings(req, res, next);
});
router.get('/plans', middleware_controller.m_checkLogin, middleware_controller.m_checkManagePlan, function (req, res, next) {
    user_controller.plan_Settings(req, res, next);
});
router.get('/ea-setting', middleware_controller.m_checkLogin, middleware_controller.m_checkManageMTAccount, function (req, res, next) {
    user_controller.ea_Settings(req, res, next);
});
router.get('/champion-setting', middleware_controller.m_checkLogin, middleware_controller.m_checkManageChampionship, function (req, res, next) {
    user_controller.championship_Settings(req, res, next);
});

///
router.get('/statistic-trader', middleware_controller.m_checkLogin, middleware_controller.m_checkSeeStatistic, function (req, res, next) {
    user_controller.statisticTrader(req, res, next);
});

router.get('/financial-area', middleware_controller.m_checkLogin, middleware_controller.m_checkSeeFinantial, function (req, res, next) {
    user_controller.finantialArea(req, res, next);
});

router.get('/backup-system', middleware_controller.m_checkLogin, middleware_controller.m_checkSeeBackup, function (req, res, next) {
    user_controller.backupSystem(req, res, next);
});

router.get('/log-system', middleware_controller.m_checkLogin, middleware_controller.m_checkSeeLogs, function (req, res, next) {
    user_controller.logSystem(req, res, next);
});

router.post('/editCurrencyPair', middleware_controller.m_checkLoginPost, middleware_controller.m_checkManagePlanPost, function (req, res, next) {
    user_controller.editCurrencyPair(req, res, next);
});
router.post('/editApprovalPlan', middleware_controller.m_checkLoginPost, middleware_controller.m_checkManagePlanPost, function (req, res, next) {
    user_controller.editApprovalPlan(req, res, next);
});
router.post('/editPlan', middleware_controller.m_checkLoginPost, middleware_controller.m_checkManagePlanPost, function (req, res, next) {
    user_controller.editPlan(req, res, next);
});
router.post('/editServerBroker', middleware_controller.m_checkLoginPost, middleware_controller.m_checkManageBrokerPost, function (req, res, next) {
    user_controller.editServerBroker(req, res, next);
});
router.post('/editNJ4XServer', middleware_controller.m_checkLoginPost, middleware_controller.m_checkManageNJ4XPost, function (req, res, next) {
    user_controller.editNJ4XServer(req, res, next);
});
router.post('/editMTAccount', middleware_controller.m_checkLoginPost, middleware_controller.m_checkManageMTAccountPost, function (req, res, next) {
    user_controller.editMTAccount(req, res, next);
});
router.post('/syncEASettingWithNj4x', middleware_controller.m_checkLoginPost, middleware_controller.m_checkManageMTAccountPost, function (req, res, next) {
    user_controller.syncEASettingWithNj4x(req, res, next);
});
router.post('/syncServerSettingWithNj4x', middleware_controller.m_checkLoginPost, middleware_controller.m_checkManageMTAccountPost, function (req, res, next) {
    user_controller.syncServerSettingWithNj4x(req, res, next);
});

module.exports = router;
