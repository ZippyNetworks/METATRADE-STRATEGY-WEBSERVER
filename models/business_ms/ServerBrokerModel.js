let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let ServerBrokerSchema = new Schema({
    id: String,
    server_name: String,
    server_ip: String,
});
// event
ServerBrokerSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('server_brokers', ServerBrokerSchema);
