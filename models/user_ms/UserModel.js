let mongoose     = require('mongoose');
let Schema       = mongoose.Schema;
let crypto = require('crypto');

let UserSchema   = new Schema({
    id: String,
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    dialCode: String,
    iso2: String,
    phone: String,
    email_verify_flag: Number,  // 1: non-verified, 2: verified
    email_verify_token: String,
    phone_verify_flag: Number,  // 1: non-verified, 2: verified
    phone_verify_token: String,
    reset_flag: Number,  // 1: usable token,  2: unusable token
    reset_token: String,
    avatar: String,
    group_id: String,
    online_state: Number,  // 1: offline, 2: online
    factor2: String,  // two factor token
    factor2_flag: Number,  // 1: usable two factor code, 2: unusable two factor code
    multiStorePro: Number,  // 1: False (only one store is available), 2: True (can add multi stores)
});
// event
UserSchema.pre('save', function (next) {
    this.id = this._id.toString();
    this.password = crypto.createHash('md5').update(this.password).digest('hex');
    next();
});

// Methods
UserSchema.methods.verifyPassword = function (password) {
    return this.password === crypto.createHash('md5').update(password).digest("hex")
};
module.exports = mongoose.model('users', UserSchema);
