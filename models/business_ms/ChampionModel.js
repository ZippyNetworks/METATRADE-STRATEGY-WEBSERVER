let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let ChampionSchema = new Schema({
    id: String,
    name: String,

    min_accounts: Number,
    max_accounts: Number,
    min_lot: Number,
    max_lot: Number,
    max_loss_daily: Number,
    max_profit_daily: Number,
    max_orders_same: Number,
    comment_order: String,
    date_start: Date,
    date_finish: Date,
    ranking_string: String,
    external_control_flag: Boolean,
    champion_code: String,
    ranking_sync_period: Number,
    what_sync: String,
    server_connect: String,
});
// event
ChampionSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('champions', ChampionSchema);
