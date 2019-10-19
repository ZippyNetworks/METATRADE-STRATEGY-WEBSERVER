let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let NJ4XServerSchema = new Schema({
    id: String,
    name: String,
    server_ip: String,
    server_port: Number,
    max_terminals: Number,
    time_sync: Number,
    status: String,
});
// event
NJ4XServerSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('nj4x_servers', NJ4XServerSchema);
