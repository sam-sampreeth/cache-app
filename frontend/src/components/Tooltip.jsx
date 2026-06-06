/**
 * Tooltip — dark brutalist style, pure CSS, no JS.
 * Wraps any element and shows a label on hover.
 *
 * Props:
 *   text      — tooltip label
 *   position  — 'bottom' (default) | 'top' | 'left' | 'right'
 *   children  — the element to wrap
 */
export default function Tooltip({ text, children, position = 'bottom' }) {
  const pos = {
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    top:    'bottom-full mb-2 left-1/2 -translate-x-1/2',
    left:   'right-full mr-2 top-1/2 -translate-y-1/2',
    right:  'left-full ml-2 top-1/2 -translate-y-1/2',
  }[position] ?? 'top-full mt-2 left-1/2 -translate-x-1/2';

  return (
    <div className="relative group/tip inline-flex">
      {children}
      <span
        className={`
          pointer-events-none absolute z-50 whitespace-nowrap
          mono text-[9px] text-neutral-200
          bg-neutral-900 border border-neutral-700
          px-2 py-1
          opacity-0 group-hover/tip:opacity-100
          transition-opacity duration-100 delay-200
          ${pos}
        `}
      >
        {text}
      </span>
    </div>
  );
}
