import React, { useState, useEffect } from 'react';
import { Terminal, ArrowRight, Play, Disc, MessageSquare, Globe, Link, Layers, Folder, Search, Hash, Zap, Eye, EyeOff, X as XClose, Loader2 } from 'lucide-react';
import { Github, Instagram, X, Youtube, Reddit, Spotify, TikTok, NoteIcon } from '../components/BrandIcons';
import { detectPlatform } from '../store/platform';
import { vault, storage } from '../store/vault';
import { useToast } from '../components/Toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';


const SUGGESTIONS = [
  'https://open.spotify.com/playlist/7xZCikQzBNvnIzcWRhxAAL',
  'https://www.reddit.com/r/AskHistorians',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://react.dev/reference/react',
  'https://x.com/elonmusk/status/1519480761749016577?s=20',
];

function PlatformIcon({ type }) {
  const cls = 'w-3.5 h-3.5 flex-shrink-0';
  switch (type) {
    case 'youtube':   return <Youtube className={cls} />;
    case 'instagram': return <Instagram className={cls} />;
    case 'reddit':    return <Reddit className={cls} />;
    case 'twitter':   return <X className={cls} />;
    case 'spotify':   return <Spotify className={cls} />;
    case 'tiktok':    return <TikTok className={cls} />;
    case 'github':    return <Github className={cls} />;
    case 'note':      return <NoteIcon className={cls} />;
    default:          return <Globe className={cls} />;
  }
}

function PlatformWatermark({ type }) {
  const cls = 'w-10 h-10 opacity-20';
  switch (type) {
    case 'youtube':   return <Youtube className={cls} />;
    case 'instagram': return <Instagram className={cls} />;
    case 'reddit':    return <Reddit className={cls} />;
    case 'twitter':   return <X className={cls} />;
    case 'spotify':   return <Spotify className={cls} />;
    case 'tiktok':    return <TikTok className={cls} />;
    case 'github':    return <Github className={cls} />;
    case 'note':      return <NoteIcon className={cls} />;
    default:          return <Globe className={cls} />;
  }
}

export default function Landing({ onLaunch }) {
  const [testUrl, setTestUrl] = useState('');
  const [scrapedResult, setScrapedResult] = useState(null);
  const [scraping, setScraping] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);

  // Logout States
  const [isLoggingOut, setIsLoggingOut] = useState(() => {
    return !!storage.get('justLoggedOut');
  });
  const [logoutProgress, setLogoutProgress] = useState(0);
  const toast = useToast();

  // Auth States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (isLoggingOut) {
      storage.remove('justLoggedOut');
      setLogoutProgress(0);
      
      const interval = setInterval(() => {
        setLogoutProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 130);

      const t = setTimeout(() => {
        clearInterval(interval);
        setIsLoggingOut(false);
        toast('Logged out successfully.', 'delete');
      }, 1500);

      return () => {
        clearInterval(interval);
        clearTimeout(t);
      };
    }
  }, [isLoggingOut, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchWithDelay = () => {
    setIsLaunching(true);
    setLaunchProgress(0);
    
    const interval = setInterval(() => {
      setLaunchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 130);

    setTimeout(() => {
      clearInterval(interval);
      onLaunch();
    }, 1500);
  };

  const handleLaunchClick = () => {
    if (vault.isAuthenticated()) {
      handleLaunchWithDelay();
    } else {
      setShowLoginModal(true);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await vault.login(email.trim(), password, rememberMe);
      storage.set('justLoggedIn', 'admin', false);
      setShowLoginModal(false);
      handleLaunchWithDelay();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await vault.loginDemo();
      storage.set('justLoggedIn', 'demo', false);
      setShowLoginModal(false);
      handleLaunchWithDelay();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    
    if (targetId === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      const navbarHeight = 64; // h-12 navbar (48px) + 16px extra breathing space
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      setActiveHighlight(targetId);
      setTimeout(() => {
        setActiveHighlight(null);
      }, 1500);
    }
  };

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!testUrl.trim()) return;
    setScraping(true);
    setScrapedResult(null);
    try {
      let finalUrl = testUrl.trim();
      if (!finalUrl.startsWith('http')) finalUrl = `https://${finalUrl}`;
      const res = await fetch(`${API_BASE}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl })
      });
      if (!res.ok) throw new Error('Failed to parse URL');
      const data = await res.json();
      setScrapedResult({
        ...data,
        url: finalUrl,
        platform: detectPlatform(finalUrl),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    } catch (err) {
      setScrapedResult({ error: err.message || 'Could not parse this URL' });
    } finally {
      setScraping(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#070708] text-neutral-200 selection:bg-accent-blue selection:text-white flex flex-col font-sans">
      
      {/* MINIMAL NAVBAR */}
      <nav className="border-b border-neutral-700 bg-neutral-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-12">
          <a 
            href="/" 
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-2 group"
          >
            <span className="w-3 h-3 bg-accent-blue transition-transform group-hover:rotate-45 duration-300" />
            <span className="font-mono text-sm font-extrabold tracking-tight text-white uppercase">
              Cache
            </span>
          </a>
          
          <div className="flex items-center gap-5 text-xs font-mono">
            <a 
              href="#workflow" 
              onClick={(e) => handleLinkClick(e, 'workflow')}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              How it works
            </a>
            <a 
              href="#features" 
              onClick={(e) => handleLinkClick(e, 'features')}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Features
            </a>
            <a 
              href="https://github.com/sam-sampreeth/cache-app" 
              target="_blank" 
              rel="noreferrer" 
              className="text-neutral-400 hover:text-neutral-200 p-1 transition-colors flex items-center justify-center"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4 text-neutral-400 hover:text-white transition-colors" />
            </a>
            <button 
              onClick={() => handleLaunchClick()}
              className="bg-accent-blue text-white font-mono text-xs font-bold px-3.5 py-1.5 border border-transparent hover:bg-neutral-950 hover:text-accent-blue hover:border-accent-blue transition-colors cursor-pointer uppercase tracking-wider"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="border-b border-neutral-700">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12">
          
          {/* Hero Content */}
          <div className="lg:col-span-5 p-6 sm:p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-700">
            <div className="space-y-6">
              <span className="font-mono text-xs text-accent-blue uppercase tracking-widest bg-accent-blue/10 px-2 py-0.5 border border-accent-blue/20 inline-block">
                [ Personal archival system ]
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-none text-neutral-100 uppercase">
                Index the chaotic web.
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-md font-sans">
                A personal quick-access internet vault for saving, organizing, and retrieving links, rich embeds, and plain-text notes. Built for power-users who live online. No cookies tracker, no heavy assets, pure speed.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => handleLaunchClick()}
                  className="bg-accent-blue border border-transparent text-white hover:bg-neutral-950 hover:border-accent-blue hover:text-accent-blue font-bold text-xs font-mono px-5 py-3 flex items-center gap-2 transition-all cursor-pointer"
                >
                  Initialize vault <ArrowRight className="w-4 h-4" />
                </button>
                <a 
                  href="#demo"
                  onClick={(e) => handleLinkClick(e, 'demo')}
                  className="bg-neutral-950 border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10 hover:border-accent-blue font-bold text-xs font-mono px-5 py-3 flex items-center justify-center transition-all"
                >
                  Try parser demo
                </a>
              </div>
        
            </div>
          </div>

          {/* Hero Visual UI Mockup */}
          <div className="lg:col-span-7 bg-[#0b0b0d] p-4 sm:p-6 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-2xl border border-neutral-700 bg-neutral-950 font-mono text-xs shadow-2xl relative overflow-hidden">
              
              {/* Mock Window Topbar */}
              <div className="border-b border-neutral-700 bg-neutral-900 px-3 py-1.5 flex justify-between items-center text-[10px] text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent-blue" />
                  Vault console
                </span>
                <span className="flex gap-1.5">
                  <span className="w-2 h-2 bg-neutral-700" />
                  <span className="w-2 h-2 bg-neutral-700" />
                  <span className="w-2 h-2 bg-accent-blue" />
                </span>
              </div>

              {/* Mock Dashboard Layout */}
              <div className="grid grid-cols-12 min-h-[320px]">
                
                {/* Mock Sidebar */}
                <div className="col-span-4 border-r border-neutral-800 p-2 space-y-3 bg-[#0a0a0c] text-[10px]">
                  <div className="text-neutral-500 font-bold">Collections</div>
                  <div className="space-y-1">
                    <div className="text-accent-blue flex items-center gap-1">├─ Entertainment</div>
                    <div className="text-neutral-400 pl-3 flex items-center gap-1">│  ├─ Music</div>
                    <div className="text-neutral-400 pl-3 flex items-center gap-1">│  └─ Memes</div>
                    <div className="text-neutral-300 flex items-center gap-1">├─ Programming</div>
                    <div className="text-neutral-400 pl-3 flex items-center gap-1">│  └─ React</div>
                    <div className="text-neutral-300 flex items-center gap-1">└─ Reading</div>
                  </div>
                  <div className="pt-2 border-t border-neutral-800 text-neutral-500">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-neutral-900 border border-neutral-800 px-1 text-neutral-400">#ai</span>
                    <span className="bg-neutral-900 border border-neutral-800 px-1 text-neutral-400">#ref</span>
                    <span className="bg-neutral-900 border border-neutral-800 px-1 text-neutral-400">#audio</span>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="col-span-8 p-3 space-y-3">
                  {/* Mock Search Bar */}
                  <div className="border border-neutral-800 bg-neutral-900 px-2 py-1 flex justify-between items-center text-[10px] text-neutral-400">
                    <span>Search items (Press '/' to focus)...</span>
                    <kbd className="bg-neutral-950 border border-neutral-800 px-1">CTRL+K</kbd>
                  </div>

                  {/* Mock Grid Cards */}
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="border border-neutral-700 bg-neutral-900 p-2 flex flex-col justify-between h-28 font-sans">
                      <div>
                        <div className="flex justify-between text-neutral-500 text-[8px] mb-1 font-mono">
                          <span>YOUTUBE</span>
                          <span>2m ago</span>
                        </div>
                        <div className="font-bold text-neutral-200 line-clamp-1">Lo-Fi Programming Set</div>
                        <div className="text-neutral-400 line-clamp-2 mt-0.5">Scraped video title metadata description...</div>
                      </div>
                      <div className="text-accent-blue mt-1 font-mono">#focus #music</div>
                    </div>
                    <div className="border border-neutral-800 bg-neutral-900 p-2 flex flex-col justify-between h-28 font-sans">
                      <div>
                        <div className="flex justify-between text-neutral-500 text-[8px] mb-1 font-mono">
                          <span>NOTE</span>
                          <span>1h ago</span>
                        </div>
                        <div className="font-bold text-neutral-200 line-clamp-1">Tailwind brutalist ideas</div>
                        <div className="text-neutral-400 line-clamp-2 mt-0.5">Use thick borders, tiny border radius, custom spacing.</div>
                      </div>
                      <div className="text-neutral-500 mt-1 font-mono">#design #ideas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* DEMO / PARSER DEMONSTRATOR SECTION */}
      <section 
        id="demo" 
        className={`border-b border-neutral-700 bg-neutral-950 py-12 px-6 transition-[box-shadow,background-color] ${
          activeHighlight === 'demo' 
            ? 'duration-0 ring-2 ring-accent-blue ring-inset bg-accent-blue/5' 
            : 'duration-1000 ease-out ring-0 ring-transparent'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-xs font-mono text-accent-blue uppercase tracking-widest">[ Test the parser ]</h2>
            <p className="text-neutral-300 text-lg font-bold">Paste any URL to view the auto-generated archive metadata card</p>
          </div>

          <form onSubmit={handleScrape} className="flex gap-2 max-w-2xl mx-auto border border-neutral-700 p-2 bg-[#0c0c0e]">
            <input 
              type="text" 
              placeholder="https://youtube.com/... or https://spotify.com/..." 
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="bg-transparent text-xs font-mono text-neutral-200 flex-grow focus:outline-none p-1 placeholder:text-neutral-600"
            />
            <button 
              type="submit" 
              disabled={scraping}
              className="bg-neutral-900 border border-neutral-700 hover:border-accent-blue hover:text-accent-blue px-4 py-2 font-mono text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {scraping
                ? <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Parsing...</span>
                : 'Parse URL'}
            </button>
          </form>

          {/* Connected Suggestions Box */}
          <div 
            className="max-w-2xl mx-auto border border-t-0 border-neutral-700 bg-neutral-900/30 px-3 py-2 flex items-center justify-between text-[11px] font-sans text-neutral-400 relative overflow-hidden"
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
          >
            <div className="flex items-center gap-2 min-w-0 z-10">
              <svg className="w-3.5 h-3.5 transform -rotate-90 flex-shrink-0" viewBox="0 0 16 16">
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  className="stroke-neutral-800"
                  strokeWidth="2"
                  fill="transparent"
                />
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  className="stroke-accent-blue animate-progress-donut"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray="37.7"
                  key={suggestionIndex}
                />
              </svg>
              <span className="text-neutral-500 font-bold flex-shrink-0">Suggested:</span>
              <button
                key={suggestionIndex}
                type="button"
                onClick={() => setTestUrl(SUGGESTIONS[suggestionIndex])}
                className="text-neutral-300 hover:text-accent-blue hover:underline transition-colors cursor-pointer text-left truncate min-w-0 animate-suggestion-flip inline-block font-mono text-[11px]"
                title="Click to populate"
              >
                {SUGGESTIONS[suggestionIndex]}
              </button>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4 z-10">
              <span className="text-neutral-400 text-[10px] select-none hidden sm:inline">[ Click URL to paste ]</span>
            </div>
          </div>

          {scrapedResult && (
            <div className="mt-10 max-w-sm mx-auto border border-neutral-800 bg-[#0b0b0d] text-xs overflow-hidden scroll-mt-20">
              {scrapedResult.error ? (
                <div className="grid-bg relative aspect-video flex items-center justify-center">
                  <span className="text-red-400 font-sans text-xs px-4 text-center">{scrapedResult.error}</span>
                </div>
              ) : (
                <>
                  {/* Preview — 16:9, same as GridCard */}
                  <div className="relative aspect-video bg-neutral-950 overflow-hidden flex-shrink-0">
                    {/* Grid background covering the entire aspect-video container */}
                    <div className="absolute inset-0 grid-bg" />

                    {/* Platform badge — top left */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="flex items-center justify-center bg-neutral-950/90 border border-neutral-800/80 p-1">
                        <PlatformIcon type={scrapedResult.platform} />
                      </span>
                    </div>

                    {/* Content container padded to sit below the badge for text/watermarks, starts from top for thumbnails */}
                    <div className={`w-full h-full relative flex items-center justify-center ${
                      scrapedResult.thumbnail ? 'pt-0' : 'pt-8'
                    }`}>
                      {scrapedResult.thumbnail ? (
                        <>
                          <img
                            src={scrapedResult.thumbnail}
                            alt=""
                            className="w-full h-full object-cover opacity-80"
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
                            <PlatformWatermark type={scrapedResult.platform} />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center select-none">
                          <PlatformWatermark type={scrapedResult.platform} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3 flex-1 flex flex-col font-sans">
                    <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1.5">
                      {scrapedResult.title}
                    </h3>
                    {scrapedResult.description && (
                      <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed mb-1.5">
                        {scrapedResult.description}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-neutral-800 px-3 py-2 flex items-center justify-between gap-2">
                    <span className="mono text-[9px] text-green-500">✓ Parsed Successfully</span>
                    <span className="mono text-[9px] text-neutral-400 flex-shrink-0">{scrapedResult.date}</span>
                  </div>
                </>
              )}
            </div>
          )}



        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section 
        id="workflow" 
        className={`border-b border-neutral-700 py-16 px-6 transition-[box-shadow,background-color] ${
          activeHighlight === 'workflow' 
            ? 'duration-0 ring-2 ring-accent-blue ring-inset bg-accent-blue/5' 
            : 'duration-1000 ease-out ring-0 ring-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-mono text-accent-blue uppercase tracking-wider">[ How it works ]</span>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-neutral-100">How links are saved</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="border border-neutral-700 bg-neutral-900/50 hover:border-accent-blue hover:bg-neutral-900 hover:shadow-[0_0_15px_rgba(0,85,255,0.03)] transition-all duration-300 p-6 flex flex-col justify-between h-48 relative overflow-hidden group cursor-default">
              <div className="text-3xl font-mono font-bold text-neutral-600 group-hover:text-accent-blue transition-colors duration-300">01</div>
              <div className="space-y-2 z-10">
                <h3 className="font-mono text-xs font-bold text-accent-blue">Paste raw URL</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Paste any URL (X, Instagram, YouTube, Spotify, Reddit) or type plain-text markdown notes into the command line.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-neutral-700 bg-neutral-900/50 hover:border-accent-blue hover:bg-neutral-900 hover:shadow-[0_0_15px_rgba(0,85,255,0.03)] transition-all duration-300 p-6 flex flex-col justify-between h-48 relative overflow-hidden group cursor-default">
              <div className="text-3xl font-mono font-bold text-neutral-600 group-hover:text-accent-blue transition-colors duration-300">02</div>
              <div className="space-y-2 z-10">
                <h3 className="font-mono text-xs font-bold text-accent-blue">Auto-parse metadata</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  The backend pipeline parses open-graph values and scrapes embeds instantly without pulling bulky media packages.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-neutral-700 bg-neutral-900/50 hover:border-accent-blue hover:bg-neutral-900 hover:shadow-[0_0_15px_rgba(0,85,255,0.03)] transition-all duration-300 p-6 flex flex-col justify-between h-48 relative overflow-hidden group cursor-default">
              <div className="text-3xl font-mono font-bold text-neutral-600 group-hover:text-accent-blue transition-colors duration-300">03</div>
              <div className="space-y-2 z-10">
                <h3 className="font-mono text-xs font-bold text-accent-blue">Nested collections</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Organize materials inside hierarchical collections, append tags, and edit notes inside a clean directory tree.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border border-neutral-700 bg-neutral-900/50 hover:border-accent-blue hover:bg-neutral-900 hover:shadow-[0_0_15px_rgba(0,85,255,0.03)] transition-all duration-300 p-6 flex flex-col justify-between h-48 relative overflow-hidden group cursor-default">
              <div className="text-3xl font-mono font-bold text-neutral-600 group-hover:text-accent-blue transition-colors duration-300">04</div>
              <div className="space-y-2 z-10">
                <h3 className="font-mono text-xs font-bold text-accent-blue">Instant retrieval</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Query items using our lightning-fast search system indexing tags, descriptions, notes, and titles.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section 
        id="features" 
        className={`border-b border-neutral-700 bg-[#0a0a0c] py-16 px-6 transition-[box-shadow,background-color] ${
          activeHighlight === 'features' 
            ? 'duration-0 ring-2 ring-accent-blue ring-inset bg-accent-blue/5' 
            : 'duration-1000 ease-out ring-0 ring-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-mono text-accent-blue uppercase tracking-wider">[ Features ]</span>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-neutral-100">Built for speed and simplicity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-neutral-800 bg-[#070708]/10">
            
            {/* Card 1 */}
            <div className="relative border-b border-r border-neutral-800 p-6 sm:p-8 outline outline-1 outline-transparent hover:outline-accent-blue hover:bg-neutral-900 hover:shadow-[0_0_15px_rgba(0,85,255,0.03)] hover:z-10 transition-all duration-300 group flex flex-col justify-between min-h-[11rem] font-sans">
              <div>
                <div className="flex justify-between items-center">
                  <Link className="w-4.5 h-4.5 text-neutral-600 group-hover:text-accent-blue transition-colors duration-300" />
                  <span className="font-mono text-[10px] text-neutral-600 group-hover:text-accent-blue transition-colors duration-300">01</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-200 mt-4 mb-2">Paste-and-go saving</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Drop a URL into the quick-add bar. Vault detects the platform, fetches the metadata, and files it. No 6-step capture flow.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative border-b border-r border-neutral-800 p-6 sm:p-8 outline outline-1 outline-transparent hover:outline-accent-blue hover:bg-neutral-900 hover:shadow-[0_0_15px_rgba(0,85,255,0.03)] hover:z-10 transition-all duration-300 group flex flex-col justify-between min-h-[11rem] font-sans">
              <div>
                <div className="flex justify-between items-center">
                  <Layers className="w-4.5 h-4.5 text-neutral-600 group-hover:text-accent-blue transition-colors duration-300" />
                  <span className="font-mono text-[10px] text-neutral-600 group-hover:text-accent-blue transition-colors duration-300">02</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-200 mt-4 mb-2">Real embedded previews</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Reels, tweets, videos, tracks, posts — rendered as proper preview cards. Not naked link soup, not raw URLs.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative border-b border-r border-neutral-800 p-6 sm:p-8 outline outline-1 outline-transparent hover:outline-accent-blue hover:bg-neutral-900 hover:shadow-[0_0_15px_rgba(0,85,255,0.03)] hover:z-10 transition-all duration-300 group flex flex-col justify-between min-h-[11rem] font-sans">
              <div>
                <div className="flex justify-between items-center">
                  <Folder className="w-4.5 h-4.5 text-neutral-600 group-hover:text-accent-blue transition-colors duration-300" />
                  <span className="font-mono text-[10px] text-neutral-600 group-hover:text-accent-blue transition-colors duration-300">03</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-200 mt-4 mb-2">Nested collections</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Folders inside folders. Build your own taxonomy — Entertainment/Anime, Programming/AI/Papers — without fighting the UI.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="relative border-b border-r border-neutral-800 p-6 sm:p-8 outline outline-1 outline-transparent hover:outline-accent-blue hover:bg-neutral-900 hover:shadow-[0_0_15px_rgba(0,85,255,0.03)] hover:z-10 transition-all duration-300 group flex flex-col justify-between min-h-[11rem] font-sans">
              <div>
                <div className="flex justify-between items-center">
                  <Search className="w-4.5 h-4.5 text-neutral-600 group-hover:text-accent-blue transition-colors duration-300" />
                  <span className="font-mono text-[10px] text-neutral-600 group-hover:text-accent-blue transition-colors duration-300">04</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-200 mt-4 mb-2">Instant global search</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Search titles, notes, tags, and URLs in one bar. Hit / from anywhere. No loading states, no lag.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="relative border-b border-r border-neutral-800 p-6 sm:p-8 outline outline-1 outline-transparent hover:outline-accent-blue hover:bg-neutral-900 hover:shadow-[0_0_15px_rgba(0,85,255,0.03)] hover:z-10 transition-all duration-300 group flex flex-col justify-between min-h-[11rem] font-sans">
              <div>
                <div className="flex justify-between items-center">
                  <Hash className="w-4.5 h-4.5 text-neutral-600 group-hover:text-accent-blue transition-colors duration-300" />
                  <span className="font-mono text-[10px] text-neutral-600 group-hover:text-accent-blue transition-colors duration-300">05</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-200 mt-4 mb-2">Tags and notes</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Add context to anything. A tweet without a note is a tweet you'll forget. Vault keeps the why alongside the what.
                </p>
              </div>
            </div>

            {/* Card 6 */}
            <div className="relative border-b border-r border-neutral-800 p-6 sm:p-8 outline outline-1 outline-transparent hover:outline-accent-blue hover:bg-neutral-900 hover:shadow-[0_0_15px_rgba(0,85,255,0.03)] hover:z-10 transition-all duration-300 group flex flex-col justify-between min-h-[11rem] font-sans">
              <div>
                <div className="flex justify-between items-center">
                  <Zap className="w-4.5 h-4.5 text-neutral-600 group-hover:text-accent-blue transition-colors duration-300" />
                  <span className="font-mono text-[10px] text-neutral-600 group-hover:text-accent-blue transition-colors duration-300">06</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-200 mt-4 mb-2">Fast retrieval</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  Keyboard-first. Dense layout. List and grid views. Built to be reopened twenty times a day without feeling slow.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="bg-neutral-950 border-b border-neutral-700 py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-100 font-sans">
            Initialize your internet archive vault.
          </h2>
          <p className="text-xs font-mono text-neutral-500 tracking-wide max-w-md mx-auto">
            Build your personal library, archive articles, save design inspirations, and notes. Instantly provisioned.
          </p>
          <button 
            onClick={() => handleLaunchClick()}
            className="bg-accent-blue text-white font-bold px-8 py-4 border border-transparent hover:bg-neutral-950 hover:text-accent-blue hover:border-accent-blue transition-all font-mono text-sm uppercase tracking-wider cursor-pointer"
          >
            Enter vault
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800 bg-[#050506] pt-12 pb-16 px-6 text-xs font-mono text-neutral-500">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-3 max-w-sm">
              <a 
                href="/" 
                onClick={(e) => handleLinkClick(e, '/')}
                className="flex items-center gap-2 group w-fit"
              >
                <span className="w-3.5 h-3.5 bg-accent-blue transition-transform group-hover:rotate-45 duration-300" />
                <span className="font-mono text-sm font-extrabold tracking-tight text-white uppercase">
                  Cache
                </span>
              </a>
              <p className="text-neutral-400 text-sm leading-relaxed font-sans">
                A raw, information-dense internet vault for modern digital collectors. Save, index, and retrieve embeds, links, and markdown text notes instantly.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-16 md:gap-28">
              <div className="space-y-3">
                <span className="text-neutral-300 font-bold tracking-wider text-[10px] block mb-3">Quick links</span>
                <ul className="space-y-2.5 text-neutral-400 font-sans text-xs">
                  <li>
                    <a 
                      href="/" 
                      onClick={(e) => handleLinkClick(e, '/')}
                      className="hover:text-white hover:underline transition-all"
                    >
                      Cache
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#workflow" 
                      onClick={(e) => handleLinkClick(e, 'workflow')}
                      className="hover:text-white hover:underline transition-all"
                    >
                      How it works
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#features" 
                      onClick={(e) => handleLinkClick(e, 'features')}
                      className="hover:text-white hover:underline transition-all"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleLaunchClick()} 
                      className="hover:text-white hover:underline transition-all cursor-pointer text-left font-sans text-xs"
                    >
                      Get started
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <span className="text-neutral-300 font-bold tracking-wider text-[10px] block mb-3">Other projects</span>
                <ul className="space-y-2.5 text-neutral-400 font-sans text-xs">
                  <li>
                    <a 
                      href="https://sampreeth.in/" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="hover:text-white hover:underline transition-all"
                    >
                      Sampreeth.in
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://portfolio.sampreeth.in/" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="hover:text-white hover:underline transition-all"
                    >
                      Portfolio
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://blogs.sampreeth.in/" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="hover:text-white hover:underline transition-all"
                    >
                      Blogs
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-neutral-500 font-mono border-t border-neutral-900 pt-6 flex justify-between items-center">
            <div>
              &copy; {new Date().getFullYear()}{' '}
              <a 
                href="https://sampreeth.in" 
                target="_blank" 
                rel="noreferrer" 
                className="text-neutral-400 hover:text-white hover:underline transition-all"
              >
                Sampreeth.in
              </a>
              . All rights reserved.
            </div>

            <button 
              onClick={(e) => handleLinkClick(e, '/')}
              className="text-neutral-400 hover:text-white transition-all flex items-center gap-1 font-mono text-[10px] cursor-pointer border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 px-2.5 py-1 bg-[#0a0a0c]"
            >
              <ArrowRight className="w-2.5 h-2.5 -rotate-90 text-accent-blue" />
              Scroll to top
            </button>
          </div>
        </div>
      </footer>

      {isLaunching && (
        <div className="fixed inset-0 bg-neutral-950/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="border border-neutral-700 bg-neutral-950 max-w-xs w-full font-mono text-xs p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center text-neutral-400 font-bold">
              <span>Loading...</span>
              <span className="text-accent-blue">{launchProgress}%</span>
            </div>
            
            <div className="font-mono text-neutral-300 tracking-tight text-sm select-none break-all">
              {`[${'█'.repeat(Math.round((launchProgress / 100) * 20))}${'░'.repeat(20 - Math.round((launchProgress / 100) * 20))}]`}
            </div>
          </div>
        </div>
      )}

      {isLoggingOut && (
        <div className="fixed inset-0 bg-neutral-950/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="border border-neutral-700 bg-neutral-950 max-w-xs w-full font-mono text-xs p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center text-neutral-400 font-bold">
              <span>Logging out securely...</span>
              <span className="text-red-500">{logoutProgress}%</span>
            </div>
            
            <div className="font-mono text-neutral-300 tracking-tight text-sm select-none break-all">
              {`[${'█'.repeat(Math.round((logoutProgress / 100) * 20))}${'░'.repeat(20 - Math.round((logoutProgress / 100) * 20))}]`}
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="border border-neutral-700 bg-neutral-950 max-w-sm w-full p-6 shadow-2xl space-y-5 relative">
            <button 
              onClick={() => { setShowLoginModal(false); setError(''); }}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors cursor-pointer p-1"
              aria-label="Close"
            >
              <XClose className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white font-sans tracking-tight">Sign in to your vault</h3>
              <p className="text-neutral-500 text-xs font-sans mt-1">Enter your credentials to access your saved links.</p>
            </div>

            {error && (
              <div className="border border-red-900 bg-red-950/20 text-red-400 p-2.5 text-[11px] font-sans rounded-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1.5 font-sans font-medium">Email</label>
                <input 
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 px-3 py-2.5 focus:outline-none focus:border-accent-blue placeholder:text-neutral-600 font-sans text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1.5 font-sans font-medium">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 px-3 py-2.5 pr-10 focus:outline-none focus:border-accent-blue placeholder:text-neutral-600 font-sans text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me toggle */}
              <div className="flex items-center text-[11px] font-sans text-neutral-400 select-none py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only" 
                  />
                  <span className={`w-4 h-4 border transition-colors ${
                    rememberMe 
                      ? 'bg-accent-blue border-accent-blue' 
                      : 'bg-black border-accent-blue'
                  }`} />
                  Remember me
                </label>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full border border-neutral-600 text-neutral-200 hover:border-accent-blue hover:text-accent-blue font-bold text-xs font-mono py-3 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1 uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="flex items-center gap-3 text-neutral-400 text-[11px] font-sans">
              <span className="h-px bg-neutral-800 flex-1"></span>
              <span>or</span>
              <span className="h-px bg-neutral-800 flex-1"></span>
            </div>

            <button 
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-accent-blue text-white border border-accent-blue hover:bg-neutral-950 hover:text-accent-blue hover:border-accent-blue font-bold text-xs font-mono py-3 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'Loading demo...' : 'Try the demo'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
