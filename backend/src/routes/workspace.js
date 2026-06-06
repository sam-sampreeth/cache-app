const express = require('express');
const router = express.Router();
const { Workspace, Collection, Item } = require('../db');
const { seedWorkspace } = require('../services/seeder');
const crypto = require('crypto');

// Get or create workspace
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let workspace = await Workspace.findOne({ id });
    if (!workspace) {
      workspace = await Workspace.create({ id });
    }
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate new random workspace ID
router.post('/', async (req, res) => {
  try {
    const id = 'ws_' + crypto.randomBytes(8).toString('hex');
    const workspace = await Workspace.create({ id });
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset demo workspace to default
router.post('/reset', async (req, res) => {
  try {
    const { workspaceId, role } = req.user;
    if (role !== 'demo') {
      return res.status(403).json({ error: 'Resetting is only allowed in demo mode.' });
    }

    // Delete all collections and items in this workspace
    await Collection.deleteMany({ workspaceId });
    await Item.deleteMany({ workspaceId });

    // Seed the workspace again
    await seedWorkspace(workspaceId);

    res.json({ success: true, message: 'Demo workspace has been reset to default.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

