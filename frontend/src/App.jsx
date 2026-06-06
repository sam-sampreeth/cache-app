import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import { vault, storage } from './store/vault';
import { ToastProvider } from './components/Toast';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [cookieConsent, setCookieConsent] = useState(() => {
    return storage.get('cookieConsent');
  });

  useEffect(() => {
    const handlePop = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleLaunch = () => {
    vault.hydrate();
    navigateTo('/app');
  };

  const handleExit = () => navigateTo('/');

  const handleAcceptCookies = () => {
    storage.set('cookieConsent', 'accepted', true);
    setCookieConsent('accepted');
  };

  const handleDeclineCookies = () => {
    storage.set('cookieConsent', 'declined', false);
    setCookieConsent('declined');
  };


  return (
    <ToastProvider>
      {currentPath === '/app'
        ? <Dashboard onExit={handleExit} />
        : <Landing onLaunch={handleLaunch} />
      }

      {!cookieConsent && (
        <div className="fixed bottom-5 left-5 z-[9998] bg-neutral-900 border border-neutral-700 p-4 max-w-sm flex flex-col gap-3 shadow-2xl">
          <p className="font-mono text-[10px] text-neutral-400 leading-normal">
            This application uses essential local storage and session cookies to authenticate and manage your workspace settings.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleDeclineCookies}
              className="border border-neutral-700 hover:border-neutral-500 hover:text-white px-2.5 py-1 text-[9px] font-mono cursor-pointer transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptCookies}
              className="bg-accent-blue border border-transparent text-white hover:bg-transparent hover:border-accent-blue hover:text-accent-blue px-3 py-1 text-[9px] font-mono font-bold cursor-pointer transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </ToastProvider>
  );
}


