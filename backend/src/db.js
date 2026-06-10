const mongoose = require('mongoose');

let useMemory = false;

// Memory stores
const workspaces = [];
const collections = [];
const items = [];

// Helper to generate unique hex ID
const generateId = () => 'mock_' + Math.random().toString(36).substring(2, 11);

// Mongoose Models
const WorkspaceModel = require('./models/Workspace');
const CollectionModel = require('./models/Collection');
const ItemModel = require('./models/Item');

// Helper to determine if we should bypass the database and use backend memory
function shouldUseMemory(obj) {
  if (useMemory) return true;
  if (!obj) return false;
  
  // Check workspaceId field
  if (obj.workspaceId && typeof obj.workspaceId === 'string' && obj.workspaceId.startsWith('demo_')) {
    return true;
  }
  
  // Check id field (for workspace querying)
  if (obj.id && typeof obj.id === 'string' && obj.id.startsWith('demo_')) {
    return true;
  }
  
  return false;
}

// Connection logic
async function connectDb(uri) {
  if (process.env.MOCK_DB === 'true') {
    console.log('\n======================================================');
    console.log('[SYSTEM] Operating in MOCK_DB (In-Memory) mode.');
    console.log('======================================================\n');
    useMemory = true;
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.warn('\n======================================================');
    console.warn('[WARNING] Failed to connect to MongoDB:', err.message);
    console.warn('[SYSTEM] Falling back to MOCK_DB (In-Memory) mode.');
    console.warn('Data will be wiped when the server restarts.');
    console.warn('======================================================\n');
    useMemory = true;
  }
}

// Wrapper Workspace
const Workspace = {
  findOne: async (query) => {
    if (shouldUseMemory(query)) {
      return workspaces.find(w => w.id === query.id) || null;
    }
    return WorkspaceModel.findOne(query);
  },
  create: async (data) => {
    if (shouldUseMemory(data)) {
      const doc = { ...data, _id: generateId(), createdAt: new Date() };
      workspaces.push(doc);
      return doc;
    }
    const doc = new WorkspaceModel(data);
    await doc.save();
    return doc;
  }
};

// Wrapper Collection
const Collection = {
  find: async (query) => {
    if (shouldUseMemory(query)) {
      let filtered = collections.filter(c => c.workspaceId === query.workspaceId);
      if (query.parentCollectionId !== undefined) {
        filtered = filtered.filter(c => c.parentCollectionId === query.parentCollectionId);
      }
      return filtered;
    }
    return CollectionModel.find(query);
  },
  create: async (data) => {
    if (shouldUseMemory(data)) {
      const doc = {
        ...data,
        _id: generateId(),
        parentCollectionId: data.parentCollectionId || null,
        createdAt: new Date()
      };
      collections.push(doc);
      return doc;
    }
    const doc = new CollectionModel(data);
    await doc.save();
    return doc;
  },
  deleteMany: async (query) => {
    if (shouldUseMemory(query)) {
      const idsToDelete = query._id && query._id.$in ? query._id.$in.map(String) : null;
      let deletedCount = 0;
      for (let i = collections.length - 1; i >= 0; i--) {
        const c = collections[i];
        if (c.workspaceId === query.workspaceId) {
          if (!idsToDelete || idsToDelete.includes(String(c._id))) {
            collections.splice(i, 1);
            deletedCount++;
          }
        }
      }
      return { deletedCount };
    }
    return CollectionModel.deleteMany(query);
  }
};

// Wrapper Item
const Item = {
  find: async (query) => {
    if (shouldUseMemory(query)) {
      let filtered = items.filter(item => item.workspaceId === query.workspaceId);

      if (query.collectionId !== undefined) {
        filtered = filtered.filter(item => {
          if (query.collectionId === null) {
            return !item.collectionId;
          }
          return String(item.collectionId) === String(query.collectionId);
        });
      }

      if (query.pinned !== undefined) {
        filtered = filtered.filter(item => {
          const isPinned = item.pinned === true || item.pinned === 'true';
          return isPinned === (query.pinned === true || query.pinned === 'true');
        });
      }

      if (query.tags) {
        filtered = filtered.filter(item => item.tags && item.tags.includes(query.tags));
      }

      if (query.$or) {
        const regexes = query.$or.map(o => {
          const key = Object.keys(o)[0];
          return { key, regex: o[key] };
        });
        filtered = filtered.filter(item => {
          return regexes.some(({ key, regex }) => {
            const val = item[key];
            if (!val) return false;
            if (Array.isArray(val)) {
              return val.some(v => regex.test(v));
            }
            return regex.test(String(val));
          });
        });
      }

      return [...filtered].sort((a, b) => b.createdAt - a.createdAt);
    }
    return ItemModel.find(query);
  },
  findOne: async (query) => {
    if (shouldUseMemory(query)) {
      const item = items.find(i => String(i._id) === String(query._id) && i.workspaceId === query.workspaceId);
      if (!item) return null;
      return {
        ...item,
        save: async function() {
          const idx = items.findIndex(i => String(i._id) === String(item._id));
          if (idx !== -1) {
            items[idx] = { ...items[idx], ...this };
          }
          return this;
        }
      };
    }
    return ItemModel.findOne(query);
  },
  create: async (data) => {
    if (shouldUseMemory(data)) {
      const doc = {
        ...data,
        _id: generateId(),
        createdAt: new Date(),
        collectionId: data.collectionId || null
      };
      items.push(doc);
      return doc;
    }
    const doc = new ItemModel(data);
    await doc.save();
    return doc;
  },
  deleteOne: async (query) => {
    if (shouldUseMemory(query)) {
      const idx = items.findIndex(i => String(i._id) === String(query._id) && i.workspaceId === query.workspaceId);
      if (idx !== -1) {
        items.splice(idx, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    }
    return ItemModel.deleteOne(query);
  },
  deleteMany: async (query) => {
    if (shouldUseMemory(query)) {
      const collectionIds = query.collectionId && query.collectionId.$in ? query.collectionId.$in.map(String) : null;
      let deletedCount = 0;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.workspaceId === query.workspaceId) {
          if (!collectionIds || collectionIds.includes(String(item.collectionId))) {
            items.splice(i, 1);
            deletedCount++;
          }
        }
      }
      return { deletedCount };
    }
    return ItemModel.deleteMany(query);
  }
};

// Memory-only cleanup for expired demo workspaces
function cleanupMemoryDemos(expirationMs) {
  const cutoff = new Date(Date.now() - expirationMs);
  let collectionsDeleted = 0;
  let itemsDeleted = 0;
  let workspacesDeleted = 0;

  // Filter collections
  for (let i = collections.length - 1; i >= 0; i--) {
    const col = collections[i];
    if (col.workspaceId.startsWith('demo_') && col.createdAt < cutoff) {
      collections.splice(i, 1);
      collectionsDeleted++;
    }
  }

  // Filter items
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.workspaceId.startsWith('demo_') && item.createdAt < cutoff) {
      items.splice(i, 1);
      itemsDeleted++;
    }
  }

  // Filter workspaces
  for (let i = workspaces.length - 1; i >= 0; i--) {
    const ws = workspaces[i];
    if (ws.id.startsWith('demo_') && ws.createdAt < cutoff) {
      workspaces.splice(i, 1);
      workspacesDeleted++;
    }
  }

  return { collectionsDeleted, itemsDeleted, workspacesDeleted };
}

module.exports = {
  connectDb,
  isMemoryMode: () => useMemory,
  Workspace,
  Collection,
  Item,
  cleanupMemoryDemos
};
