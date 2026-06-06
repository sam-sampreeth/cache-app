const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true },
  name: { type: String, required: true },
  parentCollectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Collection', collectionSchema);
