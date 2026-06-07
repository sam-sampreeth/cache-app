const ogs = require('open-graph-scraper');
const axios = require('axios');

async function scrapeUrl(url) {
  let type = 'url';
  let embedUrl = null;
  let title = '';
  let description = '';
  let thumbnail = '';

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname;

    // YouTube detection
    const ytRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i;
    const ytMatch = url.match(ytRegex);
    if (ytMatch) {
      type = 'youtube';
      const videoId = ytMatch[1];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    // Spotify detection
    else if (host.includes('spotify.com')) {
      type = 'spotify';
      // e.g., open.spotify.com/track/xyz -> open.spotify.com/embed/track/xyz
      embedUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
    }
    // Reddit detection
    else if (host.includes('reddit.com') || host.includes('redd.it')) {
      type = 'reddit';
      let cleanUrl = url.split('?')[0];
      if (!cleanUrl.endsWith('/')) {
        cleanUrl += '/';
      }
      embedUrl = `${cleanUrl}embed`;
    }
    // Instagram detection
    else if (host.includes('instagram.com')) {
      type = 'instagram';
      const instaMatch = pathname.match(/\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/);
      if (instaMatch) {
        const platformType = instaMatch[1];
        const code = instaMatch[2];
        embedUrl = `https://www.instagram.com/${platformType}/${code}/embed`;
      }
    }
    // X / Twitter detection
    else if (host.includes('twitter.com') || host.includes('x.com')) {
      type = 'x';
      const tweetMatch = pathname.match(/\/status\/(\d+)/);
      if (tweetMatch) {
        const tweetId = tweetMatch[1];
        embedUrl = `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`;
      }
    }
  } catch (err) {
    console.error("URL parsing error in scraper:", err);
  }

  // Special scraping for Reddit
  if (type === 'reddit') {
    try {
      const isPost = url.includes('/comments/');
      if (isPost) {
        // Reddit post - fetch via JSON API
        let jsonUrl = url.split('?')[0];
        if (jsonUrl.endsWith('/')) jsonUrl = jsonUrl.slice(0, -1);
        jsonUrl += '.json';
        const response = await axios.get(jsonUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 5000
        });
        if (response.data?.[0]?.data?.children?.[0]) {
          const postData = response.data[0].data.children[0].data;
          title = postData.title || '';
          description = postData.selftext || `Reddit post in ${postData.subreddit_name_prefixed}`;
          if (postData.preview?.images?.[0]) {
            thumbnail = postData.preview.images[0].source.url.replace(/&amp;/g, '&');
          } else if (postData.thumbnail?.startsWith('http')) {
            thumbnail = postData.thumbnail;
          }
        }
      } else {
        // Subreddit listing - fetch subreddit about
        const subMatch = url.match(/reddit\.com\/r\/([^/?#]+)/);
        if (subMatch) {
          const subName = subMatch[1];
          const response = await axios.get(`https://www.reddit.com/r/${subName}/about.json`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 5000
          });
          if (response.data?.data) {
            const sub = response.data.data;
            title = sub.title || `r/${subName}`;
            description = sub.public_description || sub.description_html?.replace(/<[^>]+>/g, '') || '';
            const icon = sub.community_icon?.split('?')[0] || sub.icon_img || '';
            if (icon) thumbnail = icon;
          }
        }
      }
    } catch (redditError) {
      console.warn('Reddit scrape failed, falling back to OGS:', redditError.message);
    }
  }

  // Twitter/X always blocks scraping - return early with a friendly response
  if (type === 'x') {
    try {
      const parsedUrl = new URL(url);
      const handle = parsedUrl.pathname.split('/')[1] || 'Twitter';
      title = `@${handle} on X`;
      description = 'Tweet preview is unavailable - X does not allow content scraping.';
    } catch (_) {
      title = 'X / Twitter';
      description = 'Tweet preview is unavailable.';
    }
    return { type, url, title, description, thumbnail: '', embedUrl };
  }

  // Fallback to open-graph-scraper
  if (!title) {
    try {
      const ogsOptions = {
        url: url,
        timeout: 5000,
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
      };
      const { error, result } = await ogs(ogsOptions);
      if (!error && result) {
        title = result.ogTitle || result.twitterTitle || '';
        description = result.ogDescription || result.twitterDescription || '';
        let imageUrl = '';
        if (result.ogImage && result.ogImage.length > 0) {
          imageUrl = result.ogImage[0].url;
        } else if (result.twitterImage && result.twitterImage.length > 0) {
          imageUrl = result.twitterImage[0].url;
        }

        if (imageUrl && !imageUrl.includes('/emoji/') && !imageUrl.includes('twimg.com/emoji')) {
          thumbnail = imageUrl;
        }
      }
    } catch (ogsError) {
      console.warn("Open graph scraper failed:", ogsError.message);
    }
  }

  // Fallback to hostname
  if (!title) {
    try {
      const parsed = new URL(url);
      title = parsed.hostname;
    } catch (e) {
      title = url;
    }
  }

  return {
    type,
    url,
    title,
    description,
    thumbnail,
    embedUrl
  };
}

module.exports = { scrapeUrl };
