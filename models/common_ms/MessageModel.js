let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let MessageSchema = new Schema({
    id: String,
    user_id: String,
    section: String,
    store_id: String,
    subject: String,
    content: String,
    message_from: String,  // email
    message_to: String,  // email
    status: Number,  // 1: unread, 2: read, 3: replied
    created_at: Date,
});
// event
MessageSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('messages', MessageSchema);
