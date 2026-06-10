import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { Search, Grid, List, X, LogOut, RotateCcw, Database } from 'lucide-react';
import { vault, storage } from '../store/vault';
import { fetchSpotifyThumbnail } from '../store/platform';
import QuickAdd from '../components/QuickAdd';
import ItemCard from '../components/ItemCard';
import CollectionTree from '../components/CollectionTree';
import Tooltip from '../components/Tooltip';
import { useToast } from '../components/Toast';

// ─── helpers ──────────────────────────────────────────────────────────────
function getDescendants(collections, colId) {
  const kids = collections.filter(c => c.parentId === colId);
  return kids.flatMap(c => [c.id, ...getDescendants(collections, c.id)]);
}

function EmptyState({ hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-neutral-800 text-center px-8">
      <span className="mono text-xs text-neutral-300 tracking-widest mb-3">Empty vault</span>
      <p className="text-sm text-neutral-400 max-w-sm leading-relaxed font-sans">
        {hasFilters
          ? 'No items match the current filters. Try clearing your search or selecting a different collection.'
          : 'Paste a link in the quick-add bar above, or write a plain note. Everything you save lives here, synced to your workspace.'}
      </p>
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────
export default function Dashboard({ onExit }) {
  // Hydrate store on first client render
  useEffect(() => { vault.hydrate(); }, []);

  const { workspaceId, collections, items } = useSyncExternalStore(
    vault.subscribe,
    vault.get,
    vault.get,   // SSR snapshot
  );

  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [activeTag,          setActiveTag]          = useState(null);
  const [searchQuery,        setSearchQuery]        = useState('');
  const [isListView,         setIsListView]         = useState(false);
  const searchRef = useRef(null);

  // ── Login success toast ──────────────────────────────────────────────────
  const toast = useToast();
  useEffect(() => {
    const flag = storage.get('justLoggedIn');
    if (flag) {
      storage.remove('justLoggedIn');
      toast(flag === 'demo' ? 'Welcome to the demo!' : 'Logged in successfully.', 'success');
    }
  }, [toast]);

  const handleReset = async () => {
    try {
      await vault.resetDemo();
      toast('Demo reset to default.', 'success');
    } catch (err) {
      toast('Failed to reset demo.', 'default');
    }
  };


  // Background: auto-fetch cover art for Spotify items that have no thumbnail.
  // Runs once after the vault has hydrated (workspaceId becomes non-empty).
  useEffect(() => {
    if (!workspaceId) return;
    const spotifyMissing = items.filter(
      i => i.type === 'spotify' && i.url && !i.thumbnail
    );
    if (!spotifyMissing.length) return;

    spotifyMissing.forEach(async (item) => {
      const thumb = await fetchSpotifyThumbnail(item.url);
      if (thumb) vault.updateItem(item.id, { thumbnail: thumb });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]); // intentionally runs once when vault first hydrates

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      const el = document.activeElement;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (typing) {
        if (e.key === 'Escape') el.blur();
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        // If form already expanded, focus it; otherwise expand it
        const input = document.getElementById('quick-add-input');
        if (input) { input.focus(); }
        else { document.getElementById('quick-add-trigger')?.click(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ── Filtering + sorting ──────────────────────────────────────────────────
  const filtered = items
    .filter(item => {
      if (activeCollectionId === 'pinned')       return item.pinned;
      if (activeCollectionId === null)            return true;   // all items
      if (activeCollectionId === 'uncategorized') return !item.collectionId;
      const validIds = new Set([activeCollectionId, ...getDescendants(collections, activeCollectionId)]);
      return validIds.has(item.collectionId);
    })
    .filter(item => !activeTag || (item.tags || []).includes(activeTag))
    .filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (item.title       || '').toLowerCase().includes(q) ||
        (item.url         || '').toLowerCase().includes(q) ||
        (item.note        || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.tags || []).some(t => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return  1;
      return b.createdAt - a.createdAt;
    });

  // ── Derived sidebar data ─────────────────────────────────────────────────
  const allTags = [...new Set(items.flatMap(i => i.tags || []))].sort();
  const tagCounts = {};
  items.forEach(i => (i.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));

  const getCollectionCount = (colId) => {
    const ids = new Set([colId, ...getDescendants(collections, colId)]);
    return items.filter(i => ids.has(i.collectionId)).length;
  };

  const activeCollection = collections.find(c => c.id === activeCollectionId);
  const headingText =
    activeCollectionId === 'pinned'       ? 'Pinned' :
    activeCollectionId === 'uncategorized'? 'Uncategorized' :
    activeCollection                      ? activeCollection.name :
    'All items';

  const wsShort = workspaceId ? `ws::${workspaceId.slice(0, 8)}` : 'ws::…';

  const hasFilters = !!(activeCollectionId || activeTag || searchQuery);
  const clearAll   = () => { setActiveCollectionId(null); setActiveTag(null); setSearchQuery(''); };

  // ── Library nav items ────────────────────────────────────────────────────
  const libraryItems = [
    { id: null,            label: 'All items',     count: items.length },
    { id: 'pinned',        label: 'Pinned',        count: items.filter(i => i.pinned).length },
    { id: 'uncategorized', label: 'Uncategorized', count: items.filter(i => !i.collectionId).length },
  ];

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#070708] flex flex-col md:flex-row font-sans">

      {/* ═══ LOGIN TOAST ════════════════════════════════════════════════════ */}

      {/* ═══ SIDEBAR ════════════════════════════════════════════════════════ */}
      <aside className="dashboard-sidebar-scaled w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950 flex flex-col md:h-full flex-shrink-0 overflow-y-auto">

        {/* Brand */}
        <div className="border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-2 px-4 py-2.5 group">
            <span className="w-3 h-3 bg-accent-blue flex-shrink-0 select-none transition-transform group-hover:rotate-45 duration-300" />
            <span className="font-mono text-sm font-extrabold tracking-tight text-white uppercase">Cache</span>
          </div>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 min-h-0">

          {/* Library section */}
          <div>
            <div className="mono text-[10px] text-neutral-200 mb-1.5 px-2">Library</div>
            <div className="space-y-0.5">
              {libraryItems.map(({ id, label, count }) => {
                const isActive = activeCollectionId === id && !activeTag && !searchQuery;
                return (
                  <button
                    key={label}
                    onClick={() => { setActiveCollectionId(id); setActiveTag(null); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-sans transition-all cursor-pointer ${
                      isActive
                        ? 'bg-neutral-900 shadow-[inset_0_0_0_1px_#0055ff] text-white font-medium'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="mono text-[10px] text-neutral-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collections */}
          <div>
            <div className="mono text-[10px] text-neutral-200 mb-1.5 px-2">Collections</div>
            <CollectionTree
              collections={collections}
              activeCollectionId={activeCollectionId}
              onSelect={(id) => { setActiveCollectionId(id); setActiveTag(null); }}
              onAdd={(name, parentId) => vault.addCollection(name, parentId)}
              onDelete={(id) => vault.deleteCollection(id)}
              getCount={getCollectionCount}
            />
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <div className="mono text-[10px] text-neutral-200 mb-1.5 px-2">Tags</div>
              <div className="flex flex-wrap gap-1 px-1">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`flex items-center gap-1 mono text-[9px] px-1.5 py-0.5 border transition-colors cursor-pointer ${
                      activeTag === tag
                        ? 'bg-accent-blue border-accent-blue text-white'
                        : 'border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300 bg-neutral-950'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span className={activeTag === tag ? 'text-white/60' : 'text-neutral-700'}>
                      {tagCounts[tag]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 flex-shrink-0">
          {vault.getRole() === 'demo' && (
            <button
              onClick={handleReset}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 mono text-[10px] text-neutral-400 hover:text-accent-blue border border-neutral-800 hover:border-accent-blue/50 transition-colors cursor-pointer mb-2"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to default
            </button>
          )}
          <button
            onClick={() => vault.logout()}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 mono text-[10px] text-neutral-400 hover:text-red-500 border border-neutral-800 hover:border-red-900 transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* ═══ MAIN ═══════════════════════════════════════════════════════════ */}
      <main className="dashboard-content-scaled flex-1 flex flex-col min-h-screen md:min-h-0 md:h-full">

        {/* Topbar - sticky */}
        <header className="sticky top-0 z-20 bg-[#070708] border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">

            {/* Search */}
            <div className="flex items-center gap-2 flex-1 max-w-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 focus-within:border-neutral-700 transition-colors">
              <Search className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search titles, notes, tags, urls…"
                className="w-full bg-transparent text-xs text-neutral-200 focus:outline-none placeholder:text-neutral-400 font-sans"
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="text-neutral-400 hover:text-white cursor-pointer flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:block mono text-[8px] text-neutral-500 border border-neutral-700 px-1.5 py-0.5 bg-neutral-900 select-none flex-shrink-0">
                  /
                </kbd>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Backups */}
              <Tooltip text="Backup" position="bottom">
                <button
                  onClick={() => toast('Coming soon.', 'info')}
                  className="p-2 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 bg-neutral-900/30 flex items-center justify-center cursor-pointer select-none transition-all"
                >
                  <Database className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
              <span className="mono text-[10px] text-neutral-400 hidden sm:block tabular-nums">
                {String(filtered.length).padStart(3, '0')} items
              </span>
              <div className="flex border border-neutral-800">
                <Tooltip text="Grid view" position="bottom">
                  <button
                    onClick={() => setIsListView(false)}
                    className={`p-2 cursor-pointer transition-colors ${!isListView ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'}`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip text="List view" position="bottom">
                  <button
                    onClick={() => setIsListView(true)}
                    className={`p-2 border-l border-neutral-800 cursor-pointer transition-colors ${isListView ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'}`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* QuickAdd bar */}
          <div className="px-4 py-3 border-t border-neutral-800">
            <QuickAdd
              collections={collections}
              onAdd={vault.addItem.bind(vault)}
              onAddCollection={vault.addCollection.bind(vault)}
              activeCollectionId={activeCollectionId}
            />
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 p-4 sm:p-5 overflow-y-auto bg-[#070708]">

          {/* Heading bar */}
          <div className="mb-5 flex items-start justify-between gap-2">
            <div>
              <h1 className="text-sm font-semibold text-white font-sans">{headingText}</h1>
            </div>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 mono text-[10px] text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer flex-shrink-0 mt-0.5"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Item grid / list / empty */}
          {filtered.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : isListView ? (
            <div className="flex flex-col border-t border-x border-neutral-800">
              {filtered.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  collections={collections}
                  isListView
                  onTagClick={setActiveTag}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  collections={collections}
                  onTagClick={setActiveTag}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
