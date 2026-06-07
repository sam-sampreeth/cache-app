import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Github } from '../components/BrandIcons';
import { storage } from '../store/vault';

export default function NotFound({ onNavigate }) {
  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    if (targetId === '/') {
      onNavigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetId === 'privacy') {
      onNavigate('/privacy');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      storage.set('scrollToSection', targetId);
      onNavigate('/');
    }
  };

  const handleLaunchClick = () => {
    storage.set('openLogin', 'true');
    onNavigate('/');
  };

  const handleSignIn = () => {
    storage.set('openLogin', 'true');
    onNavigate('/');
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

      {/* 404 content */}
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="border border-neutral-700 card-404-bg max-w-md w-full p-8 shadow-2xl relative space-y-6">
          <div className="space-y-2">
            <div className="font-mono text-[11px] text-accent-blue tracking-widest">
              Error 404
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Page not found
            </h1>
            <p className="text-neutral-400 text-xs leading-relaxed">
              The page you are looking for does not exist, has been removed, or is temporarily unavailable.
            </p>
          </div>

          <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="flex-1 bg-accent-blue text-white border border-accent-blue hover:bg-transparent hover:text-accent-blue hover:border-accent-blue font-bold text-xs font-mono py-3 flex items-center justify-center transition-all cursor-pointer tracking-widest"
            >
              Go to landing
            </button>
            <button
              onClick={handleSignIn}
              className="flex-1 border border-accent-blue text-accent-blue bg-transparent hover:bg-accent-blue hover:text-white font-bold text-xs font-mono py-3 flex items-center justify-center transition-all cursor-pointer tracking-widest"
            >
              Sign in
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-700 bg-[#070708] py-12 px-4 mt-auto">
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
                    <a 
                      href="/privacy" 
                      onClick={(e) => handleLinkClick(e, 'privacy')}
                      className="hover:text-white hover:underline transition-all"
                    >
                      Privacy Policy
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
          </div>
        </div>
      </footer>

    </div>
  );
}
