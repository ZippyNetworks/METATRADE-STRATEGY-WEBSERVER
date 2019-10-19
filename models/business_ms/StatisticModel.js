let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let StatisticSchema = new Schema({
    id: String,
    statistic_date: Date,
    statistic_content: String,
});
// event
StatisticSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('statistics', StatisticSchema);
