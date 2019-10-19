let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let PaymentSchema = new Schema({
    id: String,
    user_id: String,
    BANK_address: String,
    BTC_address: String,
    ETH_address: String,
    GECA_address: String,
    CCC_address: String,
    totalWithdrawAmount: Number,
    currentWithdrawAmount: Number,  // Amount of withdraw until current time for this user
    currentWithdrawDate: Date,  // Date of last withdraw date
});
// event
PaymentSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('payments', PaymentSchema);
// payment email template variables: amount, account_type, account_address, payment_confirm_link
