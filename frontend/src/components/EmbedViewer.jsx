import React, { useState } from 'react';
import { ExternalLink, Disc, FileText } from 'lucide-react';
import { Instagram, X, Youtube, Reddit, Google, Spotify } from './BrandIcons';

export default function EmbedViewer({ item }) {
  const [showEmbed, setShowEmbed] = useState(
    item.type !== 'url' && 
    item.type !== 'note' && 
    item.type !== 'youtube' &&
    item.type !== 'x' &&
    item.type !== 'spotify'
  );

  const getPlatformIcon = (type, url) => {
    if (url) {
      try {
        const host = new URL(url).hostname.toLowerCase();
        if (host.includes('google.com')) return <Google className="w-3 h-3" />;
        if (host.includes('youtube.com') || host.includes('youtu.be')) return <Youtube className="w-3 h-3" />;
        if (host.includes('reddit.com') || host.includes('redd.it')) return <Reddit className="w-3 h-3" />;
        if (host.includes('twitter.com') || host.includes('x.com')) return <X className="w-3 h-3" />;
        if (host.includes('instagram.com')) return <Instagram className="w-3 h-3" />;
        if (host.includes('spotify.com')) return <Spotify className="w-3 h-3" />;
      } catch (_) {}
    }

    switch (type) {
      case 'youtube': return <Youtube className="w-3 h-3" />;
      case 'spotify': return <Spotify className="w-3 h-3" />;
      case 'reddit': return <Reddit className="w-3 h-3" />;
      case 'instagram': return <Instagram className="w-3 h-3" />;
      case 'x': return <X className="w-3 h-3" />;
      case 'google': return <Google className="w-3 h-3" />;
      case 'note': return <FileText className="w-3 h-3 text-neutral-400" />;
      default: return <ExternalLink className="w-3 h-3 text-neutral-400" />;
    }
  };

  const getEmbedStyle = (type) => {
    switch (type) {
      case 'spotify': return 'h-[80px]';
      case 'youtube': return 'aspect-video w-full';
      case 'reddit': return 'h-[350px] w-full';
      case 'instagram': return 'h-[450px] w-full';
      case 'x': return 'h-[250px] w-full';
      default: return 'aspect-video w-full';
    }
  };

  const getAbbreviation = (type, url) => {
    if (url) {
      try {
        const host = new URL(url).hostname.toLowerCase();
        if (host.includes('google.com')) {
          return { text: 'ggl', color: 'text-blue-500' };
        }
      } catch (_) {}
    }

    switch (type) {
      case 'youtube': return { text: 'yt', color: 'text-red-500' };
      case 'spotify': return { text: 'spf', color: 'text-green-500' };
      case 'reddit': return { text: 'rdt', color: 'text-accent-orange' };
      case 'instagram': return { text: 'ig', color: 'text-pink-500' };
      case 'x': return { text: 'x', color: 'text-accent-info' };
      case 'note': return { text: 'note', color: 'text-amber-500' };
      default: return { text: 'web', color: 'text-neutral-400' };
    }
  };

  const getDomain = (url) => {
    if (!url) return '';
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '').toLowerCase();
    } catch (e) {
      return '';
    }
  };

  const abbrInfo = getAbbreviation(item.type, item.url);
  const domain = getDomain(item.url);

  return (
    <div className="w-full select-none overflow-hidden relative group">
      {showEmbed && item.type !== 'youtube' && item.type !== 'x' && item.type !== 'spotify' && item.embedUrl ? (
        <div className={`relative ${getEmbedStyle(item.type)} border-b border-neutral-700`}>
          <iframe
            src={item.embedUrl}
            className="w-full h-full border-none"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={item.title}
          />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowEmbed(false);
            }}
            className="absolute bottom-2 right-2 bg-neutral-950 border border-neutral-700 text-[9px] font-mono px-2 py-0.5 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
          >
            Show preview
          </button>
        </div>
      ) : (
        <div className={`relative w-full aspect-video bg-neutral-950 flex flex-col justify-between p-3 border-b border-neutral-700 ${item.type !== 'note' ? 'bg-grid-pattern' : ''}`}>
          {item.type === 'note' ? (
            <div className="absolute inset-0 z-0 p-3 pt-9 text-xs text-neutral-300 font-mono overflow-y-auto whitespace-pre-wrap select-text cursor-text leading-relaxed">
              {item.note || item.description}
            </div>
          ) : item.thumbnail ? (
            <div className="absolute inset-0 z-0">
              <img 
                src={item.thumbnail} 
                alt={item.title} 
                className="w-full h-full object-cover opacity-80" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 z-0 flex items-center justify-center">
              <span className={`text-3xl font-extrabold tracking-widest select-none font-sans ${abbrInfo.color}`}>
                {abbrInfo.text}
              </span>
            </div>
          )}

          {/* Card Badge Top Left */}
          <div className="z-10 flex justify-between items-start w-full">
            <span className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 px-2 py-0.5 text-[9px] font-mono tracking-wider text-neutral-400">
              {getPlatformIcon(item.type, item.url)}
              <span>
                {item.type === 'note' ? (
                  <span className="text-amber-500 font-bold font-sans">Note</span>
                ) : (
                  <span className="text-neutral-300 font-sans">{domain || abbrInfo.text}</span>
                )}
              </span>
            </span>
            {item.type !== 'youtube' && item.type !== 'x' && item.type !== 'spotify' && item.embedUrl && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmbed(true);
                }}
                className="bg-neutral-950 border border-neutral-800 px-2 py-0.5 text-[9px] font-mono hover:bg-neutral-800 hover:text-white flex items-center gap-1 text-accent-blue cursor-pointer"
              >
                Load embed
              </button>
            )}
          </div>

          <div className="z-10 mt-auto">
            {item.url && (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[9px] font-mono text-neutral-500 hover:text-accent-blue flex items-center gap-1.5 truncate max-w-full break-all"
              >
                <span>{item.url}</span>
                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
