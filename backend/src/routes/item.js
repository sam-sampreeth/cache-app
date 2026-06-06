const express = require('express');
const router = express.Router();
const { Item } = require('../db');
const { scrapeUrl } = require('../services/scraper');

// Get items
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    
    const { collectionId, tag, q, pinned } = req.query;
    const queryObj = { workspaceId };

    if (pinned !== undefined) {
      queryObj.pinned = pinned === 'true';
    }

    if (collectionId) {
      if (collectionId === 'root') {
        queryObj.collectionId = null;
      } else {
        queryObj.collectionId = collectionId;
      }
    }

    if (tag) {
      queryObj.tags = tag;
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      queryObj.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { note: searchRegex },
        { url: searchRegex },
        { tags: searchRegex }
      ];
    }

    const items = await Item.find(queryObj);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create item
router.post('/', async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const { url, note, tags, collectionId, title, type } = req.body;

    let itemData = {
      workspaceId,
      tags: (tags || []).map(t => typeof t === 'string' ? t.slice(0, 24) : t),
      note: note || '',
      collectionId: collectionId || null
    };

    if (type === 'note' || !url || url.trim() === '') {
      itemData.type = 'note';
      const cleanNote = note ? note.trim() : '';
      const cleanTitle = title ? title.trim() : '';
      
      if (!cleanNote && !cleanTitle) {
        return res.status(400).json({ error: 'Either title or note content is required for a note' });
      }

      itemData.title = cleanTitle || cleanNote.split('\n')[0].substring(0, 60);
      itemData.note = cleanNote || cleanTitle;
      itemData.description = cleanNote || cleanTitle;
    } else {
      const scraped = await scrapeUrl(url);
      itemData = {
        ...itemData,
        ...scraped
      };
      if (note) {
        itemData.note = note;
        if (scraped.type === 'youtube') {
          itemData.description = '';
        }
      }
    }

    const item = await Item.create(itemData);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const { id } = req.params;
    const { title, note, tags, collectionId, pinned, description, thumbnail } = req.body;

    const item = await Item.findOne({ _id: id, workspaceId });
    if (!item) {
      return res.status(404).json({ error: 'Item not found in this workspace' });
    }

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (thumbnail !== undefined) item.thumbnail = thumbnail;
    if (note !== undefined) {
      item.note = note;
      if (item.type === 'youtube' && note.trim() !== '') {
        item.description = '';
      }
    }
    if (tags !== undefined) item.tags = tags.map(t => typeof t === 'string' ? t.slice(0, 24) : t);
    if (collectionId !== undefined) item.collectionId = collectionId || null;
    if (pinned !== undefined) item.pinned = pinned;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const { id } = req.params;
    const result = await Item.deleteOne({ _id: id, workspaceId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
