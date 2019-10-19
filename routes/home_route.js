let express = require('express');
let router = express.Router();

let middleware_controller = require('../controllers/MiddlewareController');
let user_controller = require('../controllers/UserController');
let home_controller = require('../controllers/HomeController');

/**
 * Multi-language Support
 * */
router.get('/lang/en', function (req, res) {
    res.cookie('i18n', 'EN');
    res.redirect(req.headers.referer)
});
router.get('/lang/pl', function (req, res) {
    res.cookie('i18n', 'PL');
    res.redirect(req.headers.referer)
});

router.get('/', middleware_controller.m_checkLogin, function (req, res, next) {
    home_controller.home(req, res, next);
});
router.get('/metatrader-accounts', middleware_controller.m_checkLogin, middleware_controller.m_checkAddEditMTAccount, function (req, res, next) {
    home_controller.metatrader_accounts(req, res, next);
});
// router.get('/orders', middleware_controller.m_checkLogin, function (req, res, next) {
//     home_controller.orders(req, res, next);
// });
router.get('/messages', middleware_controller.m_checkLogin, middleware_controller.m_checkSendMessage, function (req, res, next) {
    home_controller.messages_func(req, res, next);
});
router.get('/championship', middleware_controller.m_checkLogin, middleware_controller.m_checkAttendChampion, function (req, res, next) {
    home_controller.championship(req, res, next);
});


// messages
router.post('/post-customer-messages', middleware_controller.m_checkLoginPost, middleware_controller.m_checkSendMessagePost, function (req, res, next) {
    home_controller.postCustomerMessages(req, res, next);
});
router.post('/get-unread-messages', middleware_controller.m_checkLoginPost, middleware_controller.m_checkSendMessagePost, function (req, res, next) {
    home_controller.getUnreadMessages(req, res, next);
});
router.post('/get-message-item', middleware_controller.m_checkLoginPost, middleware_controller.m_checkSendMessagePost, function (req, res, next) {
    home_controller.getMessageItem(req, res, next);
});

router.post('/new_mt_account', middleware_controller.m_checkLoginPost, middleware_controller.m_checkAddEditMTAccountPost, function (req, res, next) {
    home_controller.newMTAccount(req, res, next);
});

router.get('/performance_mt_account', middleware_controller.m_checkLogin, function (req, res, next) {
    home_controller.performanceMTAccount(req, res, next);
});
router.get('/log_mt_account', middleware_controller.m_checkLogin, function (req, res, next) {
    home_controller.logMTAccount(req, res, next);
});

module.exports = router;
