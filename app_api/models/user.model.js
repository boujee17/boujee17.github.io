// app_api/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:  { type: String, required: true, trim: true },
    hash:  { type: String, required: true }, // bcrypt hash of password
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.hash;  // never expose hash
        return ret;
      },
    },
  }
);

// Helper to set password securely
userSchema.methods.setPassword = async function (plain) {
  this.hash = await bcrypt.hash(plain, SALT_ROUNDS);
};

// Helper to validate password
userSchema.methods.validatePassword = function (plain) {
  return bcrypt.compare(plain, this.hash);
};

module.exports = mongoose.model('User', userSchema);

