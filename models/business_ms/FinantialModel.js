let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let FinantialSchema = new Schema({
    id: String,
    account_number: String,
    email: String,
    payment_date: Date,
    plan_payment_price: Number,
    comment: String,
});
// event
FinantialSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('finantial', FinantialSchema);
