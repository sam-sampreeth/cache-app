// vault.js — backend-connected store with useSyncExternalStore

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5000').replace(/\/$/, '');

let state = { workspaceId: '', collections: [], items: [] };
let listeners = new Set();
let hydrated = false;

function notify() {
  listeners.forEach(cb => cb());
}

// Map backend ObjectId/parentCollectionId to frontend id/parentId
function mapCollection(c) {
  return {
    ...c,
    id: c.id || c._id,
    parentId: c.parentId || c.parentCollectionId || null
  };
}

function mapItem(i) {
  return {
    ...i,
    id: i.id || i._id
  };
}

export const storage = {
  get(key) {
    const localData = localStorage.getItem('cache_app');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed && parsed[key] !== undefined) return parsed[key];
      } catch (e) {}
    }
    const sessionData = sessionStorage.getItem('cache_app');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        if (parsed && parsed[key] !== undefined) return parsed[key];
      } catch (e) {}
    }
    return null;
  },

  set(key, val, preferLocal = false) {
    const activeStorage = preferLocal ? localStorage : sessionStorage;
    const inactiveStorage = preferLocal ? sessionStorage : localStorage;

    // Remove from other storage first
    let inactiveData = {};
    const inactiveStr = inactiveStorage.getItem('cache_app');
    if (inactiveStr) {
      try {
        inactiveData = JSON.parse(inactiveStr);
      } catch (e) {}
    }
    if (inactiveData && inactiveData[key] !== undefined) {
      delete inactiveData[key];
      if (Object.keys(inactiveData).length === 0) {
        inactiveStorage.removeItem('cache_app');
      } else {
        inactiveStorage.setItem('cache_app', JSON.stringify(inactiveData));
      }
    }

    // Set in active storage
    let activeData = {};
    const activeStr = activeStorage.getItem('cache_app');
    if (activeStr) {
      try {
        activeData = JSON.parse(activeStr);
      } catch (e) {}
    }

    if (val === null || val === undefined) {
      if (activeData) delete activeData[key];
    } else {
      activeData[key] = val;
    }

    if (Object.keys(activeData).length === 0) {
      activeStorage.removeItem('cache_app');
    } else {
      activeStorage.setItem('cache_app', JSON.stringify(activeData));
    }
  },

  remove(key) {
    this.set(key, null, true);
    this.set(key, null, false);
  }
};

// Secure API Fetch wrapper
async function apiFetch(path, options = {}) {
  const token = storage.get('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    if (path.includes('/auth/login')) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Invalid email or password');
    }
    // Session expired or unauthorized, logout
    vault.logout();
    throw new Error('Unauthorized or session expired');
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export const vault = {
  subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  get() {
    return state;
  },

  isAuthenticated() {
    return !!storage.get('token');
  },

  getToken() {
    return storage.get('token');
  },

  getRole() {
    return storage.get('role');
  },

  async login(email, password, rememberMe = true) {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      storage.set('token', data.token, rememberMe);
      storage.set('role', data.role, rememberMe);
      storage.set('workspaceId', data.workspaceId, rememberMe);
      
      state.workspaceId = data.workspaceId;
      notify();
      return data;
    } catch (e) {
      console.error('Login failed:', e.message);
      throw e;
    }
  },

  async loginDemo() {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ isDemo: true })
      });
      
      // Store in sessionStorage (preferLocal = false)
      storage.set('token', data.token, false);
      storage.set('role', data.role, false);
      storage.set('workspaceId', data.workspaceId, false);
      
      state.workspaceId = data.workspaceId;
      notify();
      return data;
    } catch (e) {
      console.error('Demo login failed:', e.message);
      throw e;
    }
  },

  async resetDemo() {
    try {
      await apiFetch('/api/workspace/reset', {
        method: 'POST'
      });
      await this.loadData();
    } catch (e) {
      console.error('Failed to reset demo:', e.message);
      throw e;
    }
  },

  logout() {
    storage.remove('token');
    storage.remove('role');
    storage.remove('workspaceId');
    
    state = { workspaceId: '', collections: [], items: [] };
    hydrated = false;
    notify();
    
    storage.set('justLoggedOut', 'true', false);
    
    // Redirect to landing
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  },

  async hydrate() {
    if (!this.isAuthenticated()) {
      this.logout();
      return;
    }

    if (hydrated) return;
    hydrated = true;

    try {
      state.workspaceId = storage.get('workspaceId') || '';
      notify();
      await this.loadData();
    } catch (e) {
      console.warn('vault: hydration failed, logging out', e);
      this.logout();
    }
  },

  async loadData() {
    try {
      const [colsData, itemsData] = await Promise.all([
        apiFetch('/api/collections'),
        apiFetch('/api/items')
      ]);

      state = {
        ...state,
        collections: colsData.map(mapCollection),
        items: itemsData.map(mapItem)
      };
      notify();
    } catch (e) {
      console.error('Failed to load data:', e.message);
      throw e;
    }
  },

  async addItem({ url = '', title = '', note = '', tags = [], collectionId = null, type = 'link', thumbnail = null }) {
    try {
      const newItem = await apiFetch('/api/items', {
        method: 'POST',
        body: JSON.stringify({
          url,
          title,
          note,
          tags,
          collectionId,
          type,
          thumbnail
        })
      });

      const mapped = mapItem(newItem);
      state = {
        ...state,
        items: [mapped, ...state.items]
      };
      notify();
      return mapped;
    } catch (e) {
      console.error('Failed to add item:', e.message);
      throw e;
    }
  },

  async updateItem(id, updates) {
    try {
      // Map frontend updates field if any
      const payload = { ...updates };
      if (updates.parentId !== undefined) {
        payload.parentCollectionId = updates.parentId;
      }

      const updatedItem = await apiFetch(`/api/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      const mapped = mapItem(updatedItem);
      state = {
        ...state,
        items: state.items.map(i => i.id === id ? mapped : i)
      };
      notify();
      return mapped;
    } catch (e) {
      console.error('Failed to update item:', e.message);
      throw e;
    }
  },

  async deleteItem(id) {
    try {
      await apiFetch(`/api/items/${id}`, {
        method: 'DELETE'
      });

      state = {
        ...state,
        items: state.items.filter(i => i.id !== id)
      };
      notify();
    } catch (e) {
      console.error('Failed to delete item:', e.message);
      throw e;
    }
  },

  async togglePin(id) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;

    try {
      await this.updateItem(id, { pinned: !item.pinned });
    } catch (e) {
      console.error('Failed to toggle pin:', e.message);
      throw e;
    }
  },

  async addCollection(name, parentId = null) {
    try {
      const newCol = await apiFetch('/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          name,
          parentCollectionId: parentId
        })
      });

      const mapped = mapCollection(newCol);
      state = {
        ...state,
        collections: [...state.collections, mapped]
      };
      notify();
      return mapped;
    } catch (e) {
      console.error('Failed to add collection:', e.message);
      throw e;
    }
  },

  async deleteCollection(id) {
    try {
      const res = await apiFetch(`/api/collections/${id}`, {
        method: 'DELETE'
      });

      const deletedIdsSet = new Set(res.deletedIds || [id]);
      state = {
        ...state,
        collections: state.collections.filter(c => !deletedIdsSet.has(c.id)),
        items: state.items.filter(i => !deletedIdsSet.has(i.collectionId))
      };
      notify();
    } catch (e) {
      console.error('Failed to delete collection:', e.message);
      throw e;
    }
  }
};
