import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Github } from '../components/BrandIcons';
import { storage } from '../store/vault';

export default function Privacy({ onNavigate }) {
  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    if (targetId === '/') {
      onNavigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetId === 'privacy') {
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

  const scrollToAnchor = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const navbarHeight = 64;
      const pos = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: pos, behavior: 'smooth' });
    }
  };

  const SECTIONS = [
    { id: 'data-we-store', title: 'Data We Store', num: '01' },
    { id: 'cookies-sessions', title: 'Cookies & Sessions', num: '02' },
    { id: 'third-party-embeds', title: 'Third-Party Embeds', num: '03' },
    { id: 'retention-deletion', title: 'Data Retention & Deletion', num: '04' },
    { id: 'analytics', title: 'Analytics', num: '05' },
    { id: 'security', title: 'Data Security', num: '06' },
    { id: 'ownership', title: 'Content Ownership', num: '07' },
    { id: 'changes', title: 'Changes', num: '08' },
    { id: 'contact', title: 'Contact', num: '09' },
  ];

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
              href="/#workflow" 
              onClick={(e) => handleLinkClick(e, 'workflow')}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              How it works
            </a>
            <a 
              href="/#features" 
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

      {/* TWO COLUMN CONTENT */}
      <main className="flex-1 py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* STICKY SIDEBAR */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-24 space-y-6 flex-shrink-0">
            <div className="border border-neutral-700 bg-neutral-950 p-6 shadow-[4px_4px_0px_0px_rgba(42,42,45,0.8)]">
              <h1 className="text-xl font-black text-white tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-neutral-400 font-mono text-[10px] mt-1 border-b border-neutral-700 pb-4">
                Last updated: June 7, 2026
              </p>
              
              <div className="mt-6 space-y-3">
                <span className="text-neutral-400 font-mono text-[9px] font-bold tracking-widest block mb-2">
                  Policy Index
                </span>
                <nav className="flex flex-col gap-2.5 font-mono text-xs">
                  {SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToAnchor(sec.id)}
                      className="text-left text-neutral-400 hover:text-accent-blue flex gap-2 transition-colors cursor-pointer group"
                    >
                      <span className="text-accent-blue font-bold group-hover:underline">
                        [{sec.num}]
                      </span>
                      <span className="truncate group-hover:underline">{sec.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            
            <div className="border border-neutral-800 bg-neutral-950/40 p-5 text-xs text-neutral-400 leading-relaxed font-sans">
              <p>
                Cache (“the app”) is a personal internet archive and bookmarking tool designed to help users save and organize links, embeds, and notes.
              </p>
            </div>
          </aside>

          {/* STACK OF MODULAR BRUTALIST CARDS */}
          <div className="flex-1 w-full space-y-8">
            
            {/* 01. DATA WE STORE */}
            <section 
              id="data-we-store" 
              className="border-2 border-neutral-800 bg-[#0c0c0e] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#2563eb] hover:shadow-[6px_6px_0px_0px_#2563eb] transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-accent-blue text-white px-2 py-0.5">
                  01
                </span>
                <h2 className="text-base font-black text-white font-sans tracking-tight">
                  Data We Store
                </h2>
              </div>
              <div className="space-y-3 text-neutral-400 text-sm">
                <p>The app may store:</p>
                <ul className="list-disc pl-5 space-y-1.5 font-sans">
                  <li>Saved URLs and links</li>
                  <li>Notes and tags created by users</li>
                  <li>Collection/folder organization</li>
                  <li>Account session information</li>
                  <li>Basic metadata fetched from public webpages (titles, thumbnails, descriptions)</li>
                </ul>
                <p>
                  Uploaded or saved content remains associated with the user account or workspace that created it.
                </p>
              </div>
            </section>

            {/* 02. COOKIES & SESSIONS */}
            <section 
              id="cookies-sessions" 
              className="border-2 border-neutral-800 bg-[#0c0c0e] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#2563eb] hover:shadow-[6px_6px_0px_0px_#2563eb] transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-accent-blue text-white px-2 py-0.5">
                  02
                </span>
                <h2 className="text-base font-black text-white font-sans tracking-tight">
                  Cookies & Sessions
                </h2>
              </div>
              <div className="space-y-3 text-neutral-400 text-sm">
                <p>This app uses essential cookies and/or local storage for:</p>
                <ul className="list-disc pl-5 space-y-1.5 font-sans">
                  <li>Maintaining login sessions</li>
                  <li>“Remember me” functionality</li>
                  <li>Storing workspace/session identifiers</li>
                  <li>Keeping the app functional across visits</li>
                </ul>
                <p>
                  These cookies are functional only and are not used for advertising or behavioral tracking.
                </p>
              </div>
            </section>

            {/* 03. THIRD-PARTY EMBEDS */}
            <section 
              id="third-party-embeds" 
              className="border-2 border-neutral-800 bg-[#0c0c0e] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#2563eb] hover:shadow-[6px_6px_0px_0px_#2563eb] transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-accent-blue text-white px-2 py-0.5">
                  03
                </span>
                <h2 className="text-base font-black text-white font-sans tracking-tight">
                  Third-Party Embeds
                </h2>
              </div>
              <div className="space-y-3 text-neutral-400 text-sm font-sans">
                <p>Saved content may include embedded media or previews from third-party platforms such as:</p>
                <ul className="list-disc pl-5 space-y-1.5 font-sans">
                  <li>YouTube</li>
                  <li>Instagram</li>
                  <li>Reddit</li>
                  <li>X/Twitter</li>
                  <li>Spotify</li>
                </ul>
                <p>
                  These services may set their own cookies or collect data according to their respective privacy policies. Cache does not control third-party tracking or embed behavior.
                </p>
              </div>
            </section>

            {/* 04. DATA RETENTION & DELETION */}
            <section 
              id="retention-deletion" 
              className="border-2 border-neutral-800 bg-[#0c0c0e] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#2563eb] hover:shadow-[6px_6px_0px_0px_#2563eb] transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-accent-blue text-white px-2 py-0.5">
                  04
                </span>
                <h2 className="text-base font-black text-white font-sans tracking-tight">
                  Data Retention & Deletion
                </h2>
              </div>
              <div className="space-y-3 text-neutral-400 text-sm">
                <p>Saved data may remain stored until:</p>
                <ul className="list-disc pl-5 space-y-1.5 font-sans">
                  <li>It is manually deleted by the user</li>
                  <li>The account/workspace is removed</li>
                  <li>Demo content is periodically reset</li>
                </ul>
                <p>
                  Users may request deletion of their stored data if applicable.
                </p>
                <p>
                  Demo workspace content may be cleared or replaced at any time without notice.
                </p>
              </div>
            </section>

            {/* 05. ANALYTICS */}
            <section 
              id="analytics" 
              className="border-2 border-neutral-800 bg-[#0c0c0e] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#2563eb] hover:shadow-[6px_6px_0px_0px_#2563eb] transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-accent-blue text-white px-2 py-0.5">
                  05
                </span>
                <h2 className="text-base font-black text-white font-sans tracking-tight">
                  Analytics
                </h2>
              </div>
              <div className="space-y-3 text-neutral-400 text-sm">
                <p>
                  This app does not intentionally use invasive advertising or tracking systems.
                </p>
                <p>
                  If analytics tools are added in the future, this policy may be updated.
                </p>
              </div>
            </section>

            {/* 06. DATA SECURITY */}
            <section 
              id="security" 
              className="border-2 border-neutral-800 bg-[#0c0c0e] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#2563eb] hover:shadow-[6px_6px_0px_0px_#2563eb] transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-accent-blue text-white px-2 py-0.5">
                  06
                </span>
                <h2 className="text-base font-black text-white font-sans tracking-tight">
                  Data Security
                </h2>
              </div>
              <div className="space-y-3 text-neutral-400 text-sm">
                <p>
                  Reasonable efforts are made to protect stored data, but no online service can guarantee absolute security.
                </p>
              </div>
            </section>

            {/* 07. CONTENT OWNERSHIP */}
            <section 
              id="ownership" 
              className="border-2 border-neutral-800 bg-[#0c0c0e] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#2563eb] hover:shadow-[6px_6px_0px_0px_#2563eb] transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-accent-blue text-white px-2 py-0.5">
                  07
                </span>
                <h2 className="text-base font-black text-white font-sans tracking-tight">
                  Content Ownership
                </h2>
              </div>
              <div className="space-y-3 text-neutral-400 text-sm">
                <p>
                  Users remain responsible for the links, notes, and content they save. Cache does not claim ownership over externally linked content.
                </p>
              </div>
            </section>

            {/* 08. CHANGES */}
            <section 
              id="changes" 
              className="border-2 border-neutral-800 bg-[#0c0c0e] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#2563eb] hover:shadow-[6px_6px_0px_0px_#2563eb] transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-accent-blue text-white px-2 py-0.5">
                  08
                </span>
                <h2 className="text-base font-black text-white font-sans tracking-tight">
                  Changes
                </h2>
              </div>
              <div className="space-y-3 text-neutral-400 text-sm">
                <p>
                  This privacy policy may be updated occasionally as the app evolves.
                </p>
              </div>
            </section>

            {/* 09. CONTACT */}
            <section 
              id="contact" 
              className="border-2 border-neutral-800 bg-[#0c0c0e] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#2563eb] hover:shadow-[6px_6px_0px_0px_#2563eb] transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-accent-blue text-white px-2 py-0.5">
                  09
                </span>
                <h2 className="text-base font-black text-white font-sans tracking-tight">
                  Contact
                </h2>
              </div>
              <div className="space-y-3 text-neutral-400 text-sm">
                <p>
                  For questions or concerns regarding this policy, contact through the project GitHub page or portfolio contact information.
                </p>
              </div>
            </section>

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
                      href="/#workflow" 
                      onClick={(e) => handleLinkClick(e, 'workflow')}
                      className="hover:text-white hover:underline transition-all"
                    >
                      How it works
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/#features" 
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

            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-neutral-400 hover:text-white transition-all flex items-center gap-1 font-mono text-[10px] cursor-pointer border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 px-2.5 py-1 bg-[#0a0a0c]"
            >
              <ArrowRight className="w-2.5 h-2.5 -rotate-90 text-accent-blue" />
              Scroll to top
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
