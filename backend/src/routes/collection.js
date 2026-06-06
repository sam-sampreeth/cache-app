const express = require('express');
const router = express.Router();
const { Collection, Item } = require('../db');

// Get all collections for a workspace
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const collections = await Collection.find({ workspaceId });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new collection
router.post('/', async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { name, parentCollectionId } = req.body;
    
    const collection = await Collection.create({
      workspaceId,
      name,
      parentCollectionId: parentCollectionId || null
    });
    
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to recursively find all child collection IDs
async function getChildCollectionIds(parentCollectionId, workspaceId) {
  let ids = [parentCollectionId];
  const children = await Collection.find({ parentCollectionId, workspaceId });
  for (const child of children) {
    const childIds = await getChildCollectionIds(child._id || child.id, workspaceId);
    ids = ids.concat(childIds);
  }
  return ids;
}

// Delete a collection recursively
router.delete('/:id', async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { id } = req.params;

    const allCollectionIds = await getChildCollectionIds(id, workspaceId);

    // Delete all items in these collections
    await Item.deleteMany({ workspaceId, collectionId: { $in: allCollectionIds } });

    // Delete the collections themselves
    await Collection.deleteMany({ workspaceId, _id: { $in: allCollectionIds } });

    res.json({ message: 'Collection and all nested contents deleted successfully', deletedIds: allCollectionIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
