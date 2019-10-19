let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let AdminMessageSchema = new Schema({
    id: String,
    user_id: String,
    section: String,
    store_id: String,
    subject: String,
    content: String,
    created_at: Date,
});
// event
AdminMessageSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('admin_messages', AdminMessageSchema);
