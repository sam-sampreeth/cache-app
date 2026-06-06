// platform.js — URL → platform detection, labels, colors, thumbnails

export const PLATFORMS = {
  youtube:   { label: 'yt',   name: 'YouTube',      color: 'text-red-400'       },
  instagram: { label: 'ig',   name: 'Instagram',    color: 'text-pink-400'      },
  reddit:    { label: 'rdt',  name: 'Reddit',       color: 'text-orange-400'    },
  twitter:   { label: 'x',    name: 'X / Twitter',  color: 'text-sky-300'       },
  spotify:   { label: 'spf',  name: 'Spotify',      color: 'text-green-400'     },
  tiktok:    { label: 'tt',   name: 'TikTok',       color: 'text-fuchsia-300'   },
  github:    { label: 'gh',   name: 'GitHub',       color: 'text-neutral-200'   },
  note:      { label: 'note', name: 'Note',         color: 'text-accent-blue'   },
  link:      { label: 'web',  name: 'Web',          color: 'text-neutral-400'   },
};

export function getPlatform(type) {
  return PLATFORMS[type] ?? PLATFORMS.link;
}

export function detectPlatform(url) {
  if (!url || !url.trim()) return 'note';
  try {
    const raw = url.startsWith('http') ? url : `https://${url}`;
    const host = new URL(raw).hostname.replace(/^www\./, '');
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
    if (host.includes('instagram.com'))                              return 'instagram';
    if (host.includes('reddit.com'))                                 return 'reddit';
    if (host.includes('twitter.com') || host.includes('x.com'))     return 'twitter';
    if (host.includes('spotify.com'))                                return 'spotify';
    if (host.includes('tiktok.com'))                                 return 'tiktok';
    if (host.includes('github.com'))                                 return 'github';
    return 'link';
  } catch {
    return 'link';
  }
}

/** Client-side only — no fetch. Returns thumbnail URL or null. */
export function getThumbnail(url, platform) {
  if (platform !== 'youtube' || !url) return null;
  try {
    const u = new URL(url);
    let id = null;
    if (u.hostname.includes('youtu.be')) {
      id = u.pathname.slice(1).split('/')[0];
    } else {
      id = u.searchParams.get('v');
      if (!id) {
        const m = u.pathname.match(/\/(shorts|embed)\/([a-zA-Z0-9_-]+)/);
        if (m) id = m[2];
      }
    }
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

export function getHostname(url) {
  if (!url) return '';
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Fetch the cover/avatar image for any Spotify URL (album, playlist, artist, track)
 * using Spotify's public oEmbed endpoint — no API key required.
 * Returns the thumbnail URL string, or null on failure.
 */
export async function fetchSpotifyThumbnail(spotifyUrl, signal) {
  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`,
      { signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail_url ?? null;
  } catch {
    return null;
  }
}
