import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'default') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}

      {/* Toast stack — fixed bottom-right */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 bg-neutral-900 border border-neutral-700 px-3 py-2.5 min-w-[180px] max-w-xs"
            style={{ animation: 'toast-in 0.12s ease both' }}
          >
            {/* colour dot */}
            <span
              className={`w-1.5 h-1.5 flex-shrink-0 ${
                toast.type === 'delete' ? 'bg-red-500' :
                toast.type === 'add'    ? 'bg-accent-blue' :
                toast.type === 'success'? 'bg-green-500' :
                'bg-neutral-500'
              }`}
            />

            <span className="mono text-[11px] text-neutral-200 flex-1 leading-none">
              {toast.message}
            </span>

            <button
              onClick={() => dismiss(toast.id)}
              className="text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer flex-shrink-0 -mr-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/** Call anywhere inside <ToastProvider> */
export function useToast() {
  return useContext(ToastCtx);
}
