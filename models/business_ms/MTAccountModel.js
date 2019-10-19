let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let MTAccountSchema = new Schema({
    id: String,
    user_id: String,
    account_number: String,
    account_password: String,
    broker: Object,
    platform: String,
    plan: Object,
    status: String,
    server_id: String,
    create_date: Date,
});
// event
MTAccountSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('mt_accounts', MTAccountSchema);
