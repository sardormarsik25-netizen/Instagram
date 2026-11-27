const mongoose = require('mongoose');

function hidePasswordHash(_document, result) {
  delete result.passwordHash;
  return result;
}

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9._]{3,30}$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    chatNote: {
      text: { type: String, maxlength: 60 },
      expiresAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { transform: hidePasswordHash },
    toObject: { transform: hidePasswordHash },
  },
);

module.exports = mongoose.model('User', userSchema);
