let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let PlanSchema = new Schema({
    id:                     String,
    name:                   String,
    price:                  Number,
    min_lot:                Number,
    max_lot:                Number,
    max_daily_profit:       Number,
    max_daily_loss:         Number,
    daily_loss_fix:         Boolean,
    max_total_profit:       Number,
    max_total_loss:         Number,
    total_loss_fix:         Boolean,
    max_orders:             Number,
    comment:                String,
    currency_pair:          [],
    use_pre_approval:       Boolean,
    usd_for_pre_approval:   Number,
    approval_plan_id:       String,
    validity_period:        Number,
    outside_control_flag:   Boolean,
    approval_status: {
        type: String,
        default: "No Approval",
    }
});
// event
PlanSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('plans', PlanSchema);
