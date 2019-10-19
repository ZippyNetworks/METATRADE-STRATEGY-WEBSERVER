let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;

let PermissionSchema = new Schema({
    id: String,
    sql_id: Number,
    name: String,
    priority: Number,
});
// event
PermissionSchema.pre('save', function (next) {
    this.id = this._id.toString();
    next();
});

module.exports = mongoose.model('permissions', PermissionSchema);