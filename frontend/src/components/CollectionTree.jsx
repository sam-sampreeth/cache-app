import React, { useState } from 'react';
import { Folder, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';

function CollectionNode({ col, allCollections, activeCollectionId, onSelect, onAdd, onDelete, getCount, depth }) {
  const [expanded, setExpanded]   = useState(true);
  const [adding,   setAdding]     = useState(false);
  const [newName,  setNewName]    = useState('');

  const children = allCollections.filter(c => c.parentId === col.id);
  const isActive = activeCollectionId === col.id;
  const count    = getCount(col.id);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim(), col.id);
      setNewName('');
      setAdding(false);
    }
  };

  return (
    <div>
      {/* Row */}
      <div
        className={`flex items-center gap-1 py-1 group transition-all ${
          isActive
            ? 'bg-neutral-900 shadow-[inset_0_0_0_1px_#0055ff] text-white'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px`, paddingRight: '6px' }}
      >
        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(x => !x); }}
          className="w-4 h-4 flex items-center justify-center text-neutral-400 hover:text-neutral-200 flex-shrink-0 cursor-pointer"
        >
          {children.length > 0
            ? (expanded ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />)
            : <span className="w-2.5 h-2.5 block" />}
        </button>

        {/* Label */}
        <button
          onClick={() => onSelect(col.id)}
          className="flex-1 flex items-center gap-1.5 text-left min-w-0 cursor-pointer"
        >
          <Folder className="w-3 h-3 flex-shrink-0 opacity-60" />
          <span className="text-[11px] truncate font-sans">{col.name}</span>
          {count > 0 && (
            <span className="mono text-[9px] text-neutral-400 ml-auto flex-shrink-0">{count}</span>
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setAdding(true); }}
            className="p-0.5 hover:text-accent-blue transition-colors cursor-pointer"
            title="Add sub-collection"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(col.id); }}
            className="p-0.5 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete collection"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Inline add form */}
      {adding && (
        <form
          onSubmit={handleAdd}
          className="flex items-center gap-1 py-1"
          style={{ paddingLeft: `${8 + (depth + 1) * 12 + 16}px`, paddingRight: '6px' }}
        >
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Folder name…"
            className="flex-1 bg-neutral-950 border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-200 focus:outline-none focus:border-accent-blue font-sans"
            onKeyDown={e => { if (e.key === 'Escape') { setAdding(false); setNewName(''); } }}
          />
          <button type="submit" className="mono text-[9px] text-accent-blue px-1 cursor-pointer hover:text-white transition-colors">ok</button>
          <button
            type="button"
            onClick={() => { setAdding(false); setNewName(''); }}
            className="mono text-[9px] text-neutral-500 cursor-pointer hover:text-neutral-300 transition-colors"
          >esc</button>
        </form>
      )}

      {/* Children */}
      {expanded && children.map(child => (
        <CollectionNode
          key={child.id}
          col={child}
          allCollections={allCollections}
          activeCollectionId={activeCollectionId}
          onSelect={onSelect}
          onAdd={onAdd}
          onDelete={onDelete}
          getCount={getCount}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function CollectionTree({ collections, activeCollectionId, onSelect, onAdd, onDelete, getCount }) {
  const [addingRoot, setAddingRoot] = useState(false);
  const [rootName,   setRootName]   = useState('');

  const roots = collections.filter(c => !c.parentId);

  const handleAddRoot = (e) => {
    e.preventDefault();
    if (rootName.trim()) {
      onAdd(rootName.trim(), null);
      setRootName('');
      setAddingRoot(false);
    }
  };

  return (
    <div>
      {roots.map(col => (
        <CollectionNode
          key={col.id}
          col={col}
          allCollections={collections}
          activeCollectionId={activeCollectionId}
          onSelect={onSelect}
          onAdd={onAdd}
          onDelete={onDelete}
          getCount={getCount}
          depth={0}
        />
      ))}

      {addingRoot ? (
        <form
          onSubmit={handleAddRoot}
          className="flex items-center gap-1 py-1 px-2"
        >
          <input
            autoFocus
            type="text"
            value={rootName}
            onChange={e => setRootName(e.target.value)}
            placeholder="Collection name…"
            className="flex-1 bg-neutral-950 border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-200 focus:outline-none focus:border-accent-blue font-sans"
            onKeyDown={e => { if (e.key === 'Escape') { setAddingRoot(false); setRootName(''); } }}
          />
          <button type="submit" className="mono text-[9px] text-accent-blue px-1 cursor-pointer hover:text-white transition-colors">ok</button>
          <button
            type="button"
            onClick={() => { setAddingRoot(false); setRootName(''); }}
            className="mono text-[9px] text-neutral-500 cursor-pointer hover:text-neutral-300 transition-colors"
          >esc</button>
        </form>
      ) : (
        <button
          onClick={() => setAddingRoot(true)}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 mono text-[10px] text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" /> new collection
        </button>
      )}
    </div>
  );
}
