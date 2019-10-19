let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let AccountLogSchema = new Schema({
    id: String,
    account_id: String,
    log_date: Date,
    log_content: String,
});
// event
AccountLogSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('account_logs', AccountLogSchema);
