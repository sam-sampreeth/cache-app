import React, { useState, useEffect, useCallback } from 'react';
import { Pin, Trash2, ExternalLink, Maximize2, Edit2, X, Check, Folder } from 'lucide-react';
import { vault } from '../store/vault';
import { getPlatform, getHostname } from '../store/platform';
import { useToast } from './Toast';
import {
  Youtube, Reddit, X as XIcon, Instagram, Spotify, TikTok,
  Github, Globe, NoteIcon,
} from './BrandIcons';

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const BRAND_ICON = {
  youtube: Youtube, reddit: Reddit, twitter: XIcon,
  instagram: Instagram, spotify: Spotify, tiktok: TikTok,
  github: Github, note: NoteIcon, link: Globe,
};

function PlatformBadge({ type }) {
  const Icon = BRAND_ICON[type] ?? Globe;
  return (
    <span className="flex items-center justify-center bg-neutral-950/90 border border-neutral-800/80 p-1">
      <Icon className="w-3.5 h-3.5" />
    </span>
  );
}

function PlatformWatermark({ type }) {
  const Icon = BRAND_ICON[type] ?? Globe;
  return <Icon className="w-10 h-10 opacity-20" />;
}

// ─── Flat ordered collection list for select ────────────────────────────────
function flattenCollections(cols, parentId = null, depth = 0) {
  return cols
    .filter(c => c.parentId === parentId)
    .flatMap(c => [{ ...c, depth }, ...flattenCollections(cols, c.id, depth + 1)]);
}

// ═══════════════════════════════════════════════════════════════════════════
// Detail / Edit Modal
// ═══════════════════════════════════════════════════════════════════════════
function ItemModal({ item, collections, onClose, startInEditMode = false }) {
  const toast = useToast();
  const [isEditing,      setIsEditing]      = useState(startInEditMode);
  const [editTitle,      setEditTitle]      = useState(item.title      || '');
  const [editNote,       setEditNote]       = useState(item.note       || '');
  const [editDesc,       setEditDesc]       = useState(item.description|| '');
  const [editTags,       setEditTags]       = useState((item.tags || []).join(', '));
  const [editCollection, setEditCollection] = useState(item.collectionId || '');
  const [editThumbnail,  setEditThumbnail]  = useState(item.thumbnail   || '');

  const platform      = getPlatform(item.type);
  const Icon          = BRAND_ICON[item.type] ?? Globe;
  const flatCols      = flattenCollections(collections);
  const currentCol    = collections.find(c => c.id === item.collectionId);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    vault.updateItem(item.id, {
      title:        editTitle.trim() || item.title,
      note:         editNote.trim(),
      description:  editDesc.trim(),
      tags:         editTags.split(',').map(t => t.trim().toLowerCase().slice(0, 24)).filter(Boolean),
      collectionId: editCollection || null,
      thumbnail:    editThumbnail.trim() || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(item.title || '');
    setEditNote(item.note || '');
    setEditDesc(item.description || '');
    setEditTags((item.tags || []).join(', '));
    setEditCollection(item.collectionId || '');
    setEditThumbnail(item.thumbnail || '');
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-950 flex-shrink-0">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="mono text-[10px] text-neutral-500 block">{platform.name}</span>
            <span className="text-xs font-semibold text-white truncate block">{item.title}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-sans border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-sans border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> Open
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">

          {isEditing ? (
            /* ── Edit form ─────────────────────────────────────────────── */
            <div className="space-y-4">
              <div>
                <label className="block mono text-[10px] text-neutral-500 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-blue font-sans"
                />
              </div>

              <div>
                <label className="block mono text-[10px] text-neutral-500 mb-1">Note</label>
                <textarea
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  rows={4}
                  className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-blue resize-none font-sans"
                  placeholder="Add a note…"
                />
              </div>

              {item.type !== 'note' && (
                <div>
                  <label className="block mono text-[10px] text-neutral-500 mb-1">Description</label>
                  <textarea
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-blue resize-none font-sans"
                    placeholder="Description…"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mono text-[10px] text-neutral-500 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={e => setEditTags(e.target.value)}
                    maxLength={120}
                    className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 mono text-xs text-white focus:outline-none focus:border-accent-blue"
                    placeholder="tag1, tag2…"
                  />
                </div>
                <div>
                  <label className="block mono text-[10px] text-neutral-500 mb-1">Collection</label>
                  <select
                    value={editCollection}
                    onChange={e => setEditCollection(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-blue font-sans cursor-pointer"
                  >
                    <option value="">- uncategorized -</option>
                    {flatCols.map(c => (
                      <option key={c.id} value={c.id}>
                        {'  '.repeat(c.depth)}{c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Thumbnail URL - for all platforms (YouTube auto-fills, others manual) */}
              <div>
                <label className="block mono text-[10px] text-neutral-500 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={editThumbnail}
                  onChange={e => setEditThumbnail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 mono text-xs text-white focus:outline-none focus:border-accent-blue"
                  placeholder="https://… (cover art, playlist image, avatar…)"
                />
                {editThumbnail.trim() && (
                  <div className="mt-2 border border-neutral-800 overflow-hidden aspect-video">
                    <img
                      src={editThumbnail.trim()}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── View mode ─────────────────────────────────────────────── */
            <>
              {/* URL block */}
              {item.url && (
                <div className="bg-neutral-950 border border-neutral-800 px-3 py-2.5">
                  <span className="mono text-[9px] text-neutral-600 block mb-1">URL</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-accent-blue hover:underline break-all font-mono"
                  >
                    {item.url}
                  </a>
                </div>
              )}

              {/* YouTube thumbnail */}
              {item.type === 'youtube' && item.thumbnail && (
                <div className="aspect-video overflow-hidden border border-neutral-800">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Description */}
              {item.description && item.type !== 'note' && (
                <div>
                  <span className="mono text-[9px] text-neutral-600 block mb-1">Description</span>
                  <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Note */}
              {item.note && (
                <div className="bg-neutral-950 border border-neutral-800 px-3 py-3">
                  <span className="mono text-[9px] text-neutral-600 block mb-1.5">Note</span>
                  <p className="text-sm text-neutral-100 leading-relaxed whitespace-pre-wrap font-sans">
                    {item.note}
                  </p>
                </div>
              )}

              {/* Tags */}
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map(tag => (
                    <span key={tag} className="mono text-[9px] border border-neutral-700 text-neutral-400 px-2 py-0.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata footer */}
              <div className="border-t border-neutral-800 pt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 mono text-[10px] text-neutral-500">
                <span>Added {formatDate(item.createdAt)}</span>
                <span>{platform.name}</span>
                {currentCol && (
                  <span className="flex items-center gap-1">
                    <Folder className="w-3 h-3" />
                    {currentCol.name}
                  </span>
                )}
                {item.pinned && (
                  <span className="text-accent-blue flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-current" /> Pinned
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-neutral-800 bg-neutral-950 flex-shrink-0">
          {/* Left: delete + pin */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { vault.deleteItem(item.id); toast('Item removed', 'delete'); onClose(); }}
              className="flex items-center gap-1.5 px-2.5 py-1 mono text-[10px] text-neutral-500 hover:text-red-400 border border-neutral-800 hover:border-red-900 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
            <button
              onClick={() => vault.togglePin(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 mono text-[10px] border transition-colors cursor-pointer ${
                item.pinned
                  ? 'border-accent-blue text-accent-blue hover:bg-neutral-800'
                  : 'border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
              }`}
            >
              <Pin className={`w-3 h-3 ${item.pinned ? 'fill-current' : ''}`} />
              {item.pinned ? 'Unpin' : 'Pin'}
            </button>
          </div>

          {/* Right: save/cancel or close */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 mono text-[10px] border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1 mono text-[10px] bg-accent-blue text-white border border-transparent hover:bg-transparent hover:border-accent-blue hover:text-accent-blue transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3 h-3" /> Save
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="px-3 py-1 mono text-[10px] border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Grid card
// ═══════════════════════════════════════════════════════════════════════════
function GridCard({ item, collections, onTagClick }) {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [modalEditMode, setModalEditMode] = useState(false);

  return (
    <>
      <div
        className="relative bg-[#0b0b0d] border border-neutral-800 hover:border-accent-blue transition-colors flex flex-col group cursor-pointer"
        onClick={() => { setShowModal(true); setModalEditMode(false); }}
      >
        {/* Preview - 16:9 */}
        <div className="relative aspect-video bg-neutral-950 overflow-hidden flex-shrink-0">
          {/* Grid background for all non-note cards */}
          {item.type !== 'note' && (
            <div className="absolute inset-0 grid-bg" />
          )}

          {/* Platform badge - top left */}
          <div className="absolute top-2 left-2 z-10">
            <PlatformBadge type={item.type} />
          </div>

          {/* Pin badge - top right */}
          <div className="absolute top-2 right-2 z-10">
            {item.pinned ? (
              <button
                onClick={e => { e.stopPropagation(); vault.togglePin(item.id); }}
                className="p-1 bg-accent-blue text-white cursor-pointer hover:bg-blue-700 transition-colors"
                title="Unpin"
              >
                <Pin className="w-2.5 h-2.5 fill-white" />
              </button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); vault.togglePin(item.id); }}
                className="p-1 bg-neutral-950/80 border border-neutral-800 text-neutral-500 hover:text-accent-blue hover:border-accent-blue opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                title="Pin"
              >
                <Pin className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Content container padded to sit below the badge for text/watermarks, starts from top for thumbnails */}
          <div className={`w-full h-full relative flex items-center justify-center ${
            item.thumbnail ? 'pt-0' : 'pt-8'
          }`}>
            {item.thumbnail ? (
              <>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent) {
                      parent.classList.add('pt-8');
                      parent.classList.remove('pt-0');
                      const wm = parent.querySelector('.watermark-container');
                      if (wm) wm.classList.remove('hidden');
                    }
                  }}
                />
                <div className="watermark-container hidden absolute inset-0 flex items-center justify-center select-none">
                  <PlatformWatermark type={item.type} />
                </div>
              </>
            ) : item.type === 'note' ? (
              <div className="w-full h-full px-3 pb-3 overflow-hidden">
                <p className="mono text-[10px] text-neutral-400 leading-relaxed line-clamp-5">
                  {item.note || item.title}
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center select-none">
                <PlatformWatermark type={item.type} />
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-3 flex-1 flex flex-col min-h-0">
          <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1.5 font-sans">
            {item.title}
          </h3>

          {item.type !== 'note' && item.description && (
            <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed font-sans mb-1.5">
              {item.description}
            </p>
          )}

          {item.note && item.type !== 'note' && (
            <div className="bg-neutral-950 border border-neutral-800 px-2 py-1.5 mb-1.5">
              <p className="mono text-[9px] text-neutral-500 line-clamp-2 leading-relaxed">
                {item.note}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 px-3 py-2 flex items-center justify-between gap-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 min-w-0 flex-1">
            {(item.tags || []).slice(0, 3).map(tag => (
              <button
                key={tag}
                onClick={e => { e.stopPropagation(); onTagClick?.(tag); }}
                className="mono text-[9px] text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors truncate max-w-[80px] inline-block"
                title={`#${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Date (always visible) - fades on hover to show action buttons */}
          <span className="mono text-[9px] text-neutral-400 flex-shrink-0 group-hover:opacity-0 transition-opacity">
            {formatDate(item.createdAt)}
          </span>

          {/* Hover actions */}
          <div className="absolute right-3 bottom-2 flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={e => { e.stopPropagation(); setShowModal(true); setModalEditMode(false); }}
              className="p-1 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
              title="Open"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="p-1 text-neutral-500 hover:text-neutral-200 transition-colors"
                title="Open link"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={e => { e.stopPropagation(); setShowModal(true); setModalEditMode(true); }}
              className="p-1 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); vault.togglePin(item.id); }}
              className={`p-1 transition-colors cursor-pointer ${item.pinned ? 'text-accent-blue' : 'text-neutral-500 hover:text-accent-blue'}`}
              title={item.pinned ? 'Unpin' : 'Pin'}
            >
              <Pin className={`w-3 h-3 ${item.pinned ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); vault.deleteItem(item.id); toast('Item removed', 'delete'); }}
              className="p-1 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {showModal && (
        <ItemModal
          item={item}
          collections={collections}
          onClose={() => setShowModal(false)}
          startInEditMode={modalEditMode}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// List row
// ═══════════════════════════════════════════════════════════════════════════
function ListRow({ item, collections, onTagClick }) {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [modalEditMode, setModalEditMode] = useState(false);
  const Icon = BRAND_ICON[item.type] ?? Globe;

  return (
    <>
      <div
        className="bg-[#0b0b0d] flex items-center gap-3 px-3 py-2.5 border-b border-b-neutral-800 hover:shadow-[inset_0_0_0_1px_#0055ff] hover:bg-[#0b0b14] transition-all group cursor-pointer"
        onClick={() => { setShowModal(true); setModalEditMode(false); }}
      >
        {/* Brand icon */}
        <span className="flex-shrink-0 w-7 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </span>

        {/* Title + hostname */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-neutral-200 hover:text-accent-blue truncate transition-colors">
              {item.title}
            </span>
            {item.pinned && (
              <span className="w-1.5 h-1.5 bg-accent-blue flex-shrink-0 rounded-full" />
            )}
          </div>
          {/* Always render to keep consistent 2-line height across all row types */}
          <span className={`mono text-[9px] truncate block ${item.url ? 'text-neutral-400' : 'invisible select-none'}`}>
            {item.url ? getHostname(item.url) : '\u00a0'}
          </span>
        </div>

        {/* Tags - fixed width, right-justified */}
        <div className="hidden md:flex items-center justify-end gap-2 flex-shrink-0 w-36 overflow-hidden">
          {(item.tags || []).slice(0, 2).map(tag => (
            <button
              key={tag}
              onClick={e => { e.stopPropagation(); onTagClick?.(tag); }}
              className="mono text-[9px] text-neutral-400 hover:text-neutral-200 cursor-pointer transition-colors truncate"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Date - fixed width */}
        <span className="mono text-[9px] text-neutral-400 hidden sm:block flex-shrink-0 w-24 text-right">
          {formatDate(item.createdAt)}
        </span>

        {/* Actions - fixed width so layout is stable whether ExternalLink shows or not */}
        <div
          className="flex items-center justify-end gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-28"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => { setShowModal(true); setModalEditMode(false); }}
            className="p-1 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
            title="Open"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-neutral-500 hover:text-neutral-200 transition-colors"
              title="Open link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => { setShowModal(true); setModalEditMode(true); }}
            className="p-1 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => vault.togglePin(item.id)}
            className={`p-1 transition-colors cursor-pointer ${item.pinned ? 'text-accent-blue' : 'text-neutral-500 hover:text-accent-blue'}`}
            title={item.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={`w-3.5 h-3.5 ${item.pinned ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => { vault.deleteItem(item.id); toast('Item removed', 'delete'); }}
            className="p-1 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showModal && (
        <ItemModal
          item={item}
          collections={collections}
          onClose={() => setShowModal(false)}
          startInEditMode={modalEditMode}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════
export default function ItemCard({ item, collections, isListView = false, onTagClick }) {
  if (isListView) return <ListRow item={item} collections={collections} onTagClick={onTagClick} />;
  return <GridCard item={item} collections={collections} onTagClick={onTagClick} />;
}
