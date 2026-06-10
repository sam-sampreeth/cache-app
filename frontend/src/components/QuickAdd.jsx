import React, { useState, useEffect } from 'react';
import { Plus, Link, FileText, Image, Type, Tag } from 'lucide-react';
import { detectPlatform, getThumbnail, getHostname, fetchSpotifyThumbnail } from '../store/platform';
import { useToast } from './Toast';
import { 
  Youtube, 
  Instagram, 
  Reddit, 
  X as XIcon, 
  Spotify, 
  TikTok, 
  Github, 
  Globe, 
  NoteIcon 
} from './BrandIcons';

// Flatten collections in tree order for the dropdown
function flattenCollections(cols, parentId = null, depth = 0) {
  return cols
    .filter(c => c.parentId === parentId)
    .flatMap(c => [{ ...c, depth }, ...flattenCollections(cols, c.id, depth + 1)]);
}

function getCollectionPath(cols, col) {
  const path = [col.name];
  let current = col;
  while (current.parentId) {
    const parent = cols.find(c => c.id === current.parentId);
    if (!parent) break;
    path.unshift(parent.name);
    current = parent;
  }
  return path.join(' / ');
}

function renderPlatformIcon(type) {
  const className = "w-3.5 h-3.5 flex-shrink-0";
  switch (type) {
    case 'youtube':   return <Youtube className={className} />;
    case 'instagram': return <Instagram className={className} />;
    case 'reddit':    return <Reddit className={className} />;
    case 'twitter':   return <XIcon className={className} />;
    case 'spotify':   return <Spotify className={className} />;
    case 'tiktok':    return <TikTok className={className} />;
    case 'github':    return <Github className={className} />;
    case 'note':      return <NoteIcon className={className} />;
    default:          return <Globe className={className} />;
  }
}

export default function QuickAdd({ collections, onAdd, onAddCollection, activeCollectionId }) {
  const toast = useToast();
  const [isExpanded,   setIsExpanded]   = useState(false);
  const [url,          setUrl]          = useState('');
  const [title,        setTitle]        = useState('');
  const [note,         setNote]         = useState('');
  const [tags,         setTags]         = useState('');
  const [thumbnail,    setThumbnail]    = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName,    setNewCollectionName]    = useState('');

  const handleCreateCollection = async () => {
    const name = newCollectionName.trim();
    if (!name) return;
    try {
      const newCol = await onAddCollection(name, null);
      setIsCreatingCollection(false);
      setNewCollectionName('');
      if (newCol && newCol.id) {
        setCollectionId(newCol.id);
      }
    } catch (err) {
      toast('Failed to create collection', 'default');
    }
  };

  // Sync active collection into the form
  useEffect(() => {
    const validId = activeCollectionId &&
      activeCollectionId !== 'pinned' &&
      activeCollectionId !== 'uncategorized'
        ? activeCollectionId
        : '';
    setCollectionId(validId);
  }, [activeCollectionId]);

  const detectedType = detectPlatform(url);
  const flatCollections = flattenCollections(collections);

  // Auto-fetch Spotify cover art when a Spotify URL is entered (debounced 600ms)
  useEffect(() => {
    if (detectedType !== 'spotify' || !url.trim()) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const thumb = await fetchSpotifyThumbnail(url.trim(), controller.signal);
      if (thumb) setThumbnail(thumb);
    }, 600);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [url, detectedType]);

  const reset = () => {
    setUrl(''); setTitle(''); setNote(''); setTags('');
    setThumbnail('');
    setCollectionId('');
    setIsExpanded(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const urlTrimmed  = url.trim();
    const noteTrimmed = note.trim();
    if (!urlTrimmed && !noteTrimmed) return;

    setIsLoading(true);
    try {
      const type           = urlTrimmed ? detectPlatform(urlTrimmed) : 'note';
      // YouTube: auto-derive. Everything else: use manually entered thumbnail URL if provided.
      const autoThumb      = getThumbnail(urlTrimmed, type);
      const finalThumbnail = autoThumb || thumbnail.trim() || null;
      const hostname       = getHostname(urlTrimmed);

      let finalUrl = urlTrimmed;
      if (finalUrl && !finalUrl.startsWith('http')) finalUrl = `https://${finalUrl}`;

      await onAdd({
        url:          finalUrl,
        title:        title.trim() || hostname || noteTrimmed.slice(0, 60) || 'Untitled',
        note:         noteTrimmed,
        tags:         tags.split(',').map(t => t.trim().toLowerCase().slice(0, 24)).filter(Boolean),
        collectionId: collectionId || null,
        type,
        thumbnail:    finalThumbnail,
      });
      reset();
      toast('Item saved', 'add');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Collapsed state ──────────────────────────────────────────────────────
  if (!isExpanded) {
    return (
      <div
        id="quick-add-trigger"
        onClick={() => setIsExpanded(true)}
        className="border border-dashed border-white/40 hover:border-white/60 bg-neutral-950 hover:bg-neutral-900/40 px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all"
      >
        <div className="flex items-center gap-2 text-neutral-400 hover:text-neutral-300 transition-colors">
          <Plus className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs font-sans">Paste a URL or write a note…</span>
        </div>
        <kbd className="hidden sm:block mono text-[9px] text-neutral-500 border border-neutral-700 px-1.5 py-0.5 bg-neutral-900 select-none">
          N
        </kbd>
      </div>
    );
  }

  // ── Expanded form ────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="border border-white/15 bg-[#0a0a0c]">

      {/* Row 1 - URL */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/[0.07]">
        <Link className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
        <input
          id="quick-add-input"
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste a URL, or leave blank for a note"
          className="flex-1 bg-transparent text-xs font-sans text-white focus:outline-none placeholder:text-neutral-500"
          autoFocus
        />
        {url.trim() && (
          <div className="flex items-center justify-center p-1.5 border border-neutral-800 bg-neutral-900/50 flex-shrink-0 select-none">
            {renderPlatformIcon(detectedType)}
          </div>
        )}
      </div>

      {/* Row 2 - Title */}
      <div className="flex items-center gap-2.5 px-3.5 py-2 border-b border-white/[0.07]">
        <Type className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full bg-transparent text-xs font-sans text-white focus:outline-none placeholder:text-neutral-500"
        />
      </div>

      {/* Row 3 - Note */}
      <div className="flex items-start gap-2.5 px-3.5 py-2 border-b border-white/[0.07]">
        <FileText className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0 mt-0.5" />
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Note (optional)"
          rows={2}
          className="w-full bg-transparent text-xs font-sans leading-tight text-white focus:outline-none placeholder:text-neutral-500 resize-none"
        />
      </div>

      {/* Row 4 - Thumbnail (non-YouTube, non-note only) */}
      {url.trim() && detectedType !== 'youtube' && detectedType !== 'note' && (
        <div className="flex items-center gap-2.5 px-3.5 py-2 border-b border-white/[0.07]">
          <Image className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
          <input
            type="text"
            value={thumbnail}
            onChange={e => setThumbnail(e.target.value)}
            placeholder="Thumbnail URL (optional)"
            className="w-full bg-transparent text-xs font-sans text-white focus:outline-none placeholder:text-neutral-500"
          />
        </div>
      )}

      {/* Row 5 - Tags + collection + actions */}
      <div className="flex flex-wrap items-center gap-2 px-3.5 py-2.5 bg-neutral-950/40 border-t border-white/[0.07]">
        <div className="flex items-center gap-2.5 flex-1 min-w-[120px]">
          <Tag className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="tags, comma separated"
            maxLength={120}
            className="flex-1 bg-transparent text-xs font-sans text-white focus:outline-none placeholder:text-neutral-500"
          />
        </div>

        {isCreatingCollection ? (
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 px-1.5 py-0.5 w-[240px]">
            <input
              type="text"
              placeholder="New collection..."
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none font-sans flex-1 min-w-0"
              autoFocus
              onKeyDown={async e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  await handleCreateCollection();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsCreatingCollection(false);
                  setNewCollectionName('');
                  setCollectionId('');
                }
              }}
            />
            <button
              type="button"
              onClick={handleCreateCollection}
              className="text-[10px] text-accent-blue hover:text-white font-mono cursor-pointer px-1 py-0.5"
            >
              ok
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreatingCollection(false);
                setNewCollectionName('');
                setCollectionId('');
              }}
              className="text-[10px] text-neutral-500 hover:text-neutral-300 font-mono cursor-pointer px-1 py-0.5"
            >
              esc
            </button>
          </div>
        ) : (
          <select
            value={collectionId}
            onChange={e => {
              if (e.target.value === 'new_collection') {
                setIsCreatingCollection(true);
                setNewCollectionName('');
              } else {
                setCollectionId(e.target.value);
              }
            }}
            className="bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 px-2 py-1 focus:outline-none font-sans cursor-pointer max-w-[160px] truncate"
          >
            <option value="">uncategorized</option>
            {flatCollections.map(c => (
              <option key={c.id} value={c.id}>
                {getCollectionPath(collections, c)}
              </option>
            ))}
            <option value="new_collection">+ new collection...</option>
          </select>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={reset}
            className="border border-red-900 text-red-500 hover:text-red-400 hover:border-red-700 px-3 py-1 text-[10px] font-sans transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || (!url.trim() && !note.trim())}
            className="bg-accent-blue text-white border border-transparent hover:bg-transparent hover:border-accent-blue hover:text-accent-blue px-4 py-1 text-[10px] font-sans font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving' : 'Save'}
          </button>
        </div>
      </div>
    </form>

  );
}
