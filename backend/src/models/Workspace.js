const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workspace', workspaceSchema);
