let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let GroupSchema = new Schema({
    id: String,
    sql_id: Number,
    name: String,
    role: Number,
    permissions: {
        type: Array,
        default: []
    }
});
// event
GroupSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('groups', GroupSchema);