let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let ApprovalPlanSchema = new Schema({
    id: String,
    name: String,
    min_lot: Number,
    max_lot: Number,
    max_daily_profit: Number,
    max_daily_loss: Number,
    max_total_profit: Number,
    max_total_loss: Number,
    max_orders: Number,
    comment: String,
    currency_pair: [],
});
// event
ApprovalPlanSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('approval_plans', ApprovalPlanSchema);
