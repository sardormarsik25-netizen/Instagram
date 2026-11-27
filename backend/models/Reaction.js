const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind: { type: String, enum: ['story', 'note'], required: true },
  target: { type: String, required: true },
}, { timestamps: true });

reactionSchema.index({ actor: 1, kind: 1, target: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);
