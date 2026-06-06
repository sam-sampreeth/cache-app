const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true },
  type: {
    type: String,
    enum: ['url', 'note', 'instagram', 'youtube', 'reddit', 'x', 'spotify'],
    required: true
  },
  url: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  embedUrl: { type: String },
  tags: [{ type: String }],
  note: { type: String },
  pinned: { type: Boolean, default: false },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);
