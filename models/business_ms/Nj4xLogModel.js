let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let Nj4xLogSchema = new Schema({
    id: String,
    nj4x_id: String,
    log_date: Date,
    log_content: String,
});
// event
Nj4xLogSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('nj4x_logs', Nj4xLogSchema);
