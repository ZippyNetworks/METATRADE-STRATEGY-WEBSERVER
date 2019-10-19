let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let NotificationSchema = new Schema({
    id: String,
    user_id: String,
    email: Object,  // {order, message, day, week, month, year}
    sms: Object,  // {earnings, week, month, year}
    browser: Object,  // {order, message}
});
// event
NotificationSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});

module.exports = mongoose.model('notifications', NotificationSchema);
