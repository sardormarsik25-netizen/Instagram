const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  image: { type: Buffer, required: true, select: false },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
