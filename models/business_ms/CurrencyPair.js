let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let CurrencyPairSchema = new Schema({
    id: String,
    name: String,
});
// event
CurrencyPairSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('currency_pairs', CurrencyPairSchema);
