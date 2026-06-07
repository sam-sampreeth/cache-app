const { Collection, Item } = require('../db');

function createDemoCollections(workspaceId) {
  return [
    { key: 'col-entertainment', name: 'Entertainment', parentKey: null },
    { key: 'col-anime',         name: 'Anime',          parentKey: 'col-entertainment' },
    { key: 'col-music',         name: 'Music',          parentKey: 'col-entertainment' },
    { key: 'col-programming',   name: 'Programming',    parentKey: null },
    { key: 'col-react',         name: 'React',          parentKey: 'col-programming' },
    { key: 'col-ai',            name: 'AI',             parentKey: 'col-programming' },
    { key: 'col-inspiration',   name: 'Inspiration',    parentKey: null },
    { key: 'col-reading',       name: 'Reading',        parentKey: null },
  ];
}

function createDemoItems(workspaceId, colMap) {
  const now = new Date();
  
  return [
    {
      type: 'youtube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Never Gonna Give You Up - Rick Astley',
      description: "Rick Astley's classic 1987 hit. Possibly the internet's most legendary video.",
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      tags: ['classic', 'video'],
      note: '',
      collectionId: colMap['col-music'],
      pinned: false,
      createdAt: new Date(now.getTime() - 86400000 * 7),
    },
    {
      type: 'url',
      url: 'https://react.dev/learn',
      title: 'React Docs - Learn React',
      description: 'The official React documentation. Start here if you want to learn React from scratch.',
      thumbnail: null,
      tags: ['docs', 'frontend'],
      note: '',
      collectionId: colMap['col-react'],
      pinned: true,
      createdAt: new Date(now.getTime() - 86400000 * 5),
    },
    {
      type: 'url', // mapping github to url / custom type handled by frontend platform wrapper
      url: 'https://github.com/TanStack/router',
      title: 'TanStack Router',
      description: 'Type-safe routing for React and Solid with first-class search params.',
      thumbnail: null,
      tags: ['router', 'typescript'],
      note: '',
      collectionId: colMap['col-programming'],
      pinned: false,
      createdAt: new Date(now.getTime() - 86400000 * 4),
    },
    {
      type: 'spotify',
      url: 'https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy',
      title: 'Abbey Road - The Beatles',
      description: "The Beatles' eleventh studio album. Released in 1969.",
      thumbnail: null,
      tags: ['album'],
      note: '',
      collectionId: colMap['col-music'],
      pinned: false,
      createdAt: new Date(now.getTime() - 86400000 * 3),
    },
    {
      type: 'note',
      url: '',
      title: 'Anime to watch this winter',
      description: 'Anime to watch:\n- Frieren: Beyond Journey\'s End\n- Dungeon Meshi\n- Mushishi (rewatch)\n- Vinland Saga S2',
      thumbnail: null,
      tags: ['watchlist'],
      note: 'Anime to watch:\n- Frieren: Beyond Journey\'s End\n- Dungeon Meshi\n- Mushishi (rewatch)\n- Vinland Saga S2',
      collectionId: colMap['col-anime'],
      pinned: false,
      createdAt: new Date(now.getTime() - 86400000 * 2),
    },
    {
      type: 'url',
      url: 'https://news.ycombinator.com/',
      title: 'Hacker News',
      description: 'Social news for hackers and founders. Computer science, startups, and intellectual curiosity.',
      thumbnail: null,
      tags: ['daily'],
      note: '',
      collectionId: colMap['col-reading'],
      pinned: true,
      createdAt: new Date(now.getTime() - 86400000 * 1),
    },
    {
      type: 'x',
      url: 'https://x.com/levelsio/status/1750000000000000000',
      title: 'Thread on building indie products - @levelsio',
      description: 'Levels.io shares insights from years of building profitable solo products.',
      thumbnail: null,
      tags: ['thread', 'indie'],
      note: '',
      collectionId: colMap['col-inspiration'],
      pinned: false,
      createdAt: new Date(now.getTime() - 86400000 * 0.5),
    },
    {
      type: 'reddit',
      url: 'https://www.reddit.com/r/MachineLearning/',
      title: 'r/MachineLearning',
      description: 'A community dedicated to machine learning research, papers, and discussion.',
      thumbnail: null,
      tags: ['community'],
      note: '',
      collectionId: colMap['col-ai'],
      pinned: false,
      createdAt: now,
    },
    {
      type: 'instagram',
      url: 'https://www.instagram.com/natgeo/',
      title: '@natgeo - National Geographic',
      description: 'Inspiring people to care about the planet since 1888. Photography, science, and exploration.',
      thumbnail: null,
      tags: [],
      note: '',
      collectionId: colMap['col-inspiration'],
      pinned: false,
      createdAt: new Date(now.getTime() - 86400000 * 0.3),
    },
    {
      type: 'url',
      url: 'https://www.tiktok.com/@nasa',
      title: '@nasa - NASA on TikTok',
      description: 'Space is open to everyone. Explore the universe with NASA.',
      thumbnail: null,
      tags: [],
      note: '',
      collectionId: colMap['col-inspiration'],
      pinned: false,
      createdAt: new Date(now.getTime() - 86400000 * 0.2),
    },
  ];
}

async function seedWorkspace(workspaceId) {
  try {
    const colMap = {};
    const cols = createDemoCollections(workspaceId);
    
    // Create root collections first, then child collections
    const rootCols = cols.filter(c => c.parentKey === null);
    const childCols = cols.filter(c => c.parentKey !== null);
    
    for (const c of rootCols) {
      const created = await Collection.create({
        workspaceId,
        name: c.name,
        parentCollectionId: null
      });
      colMap[c.key] = created._id;
    }
    
    for (const c of childCols) {
      const parentId = colMap[c.parentKey];
      const created = await Collection.create({
        workspaceId,
        name: c.name,
        parentCollectionId: parentId || null
      });
      colMap[c.key] = created._id;
    }
    
    const items = createDemoItems(workspaceId, colMap);
    for (const item of items) {
      await Item.create({
        workspaceId,
        ...item
      });
    }
    
    console.log(`[SEED] Seeded workspace ${workspaceId} successfully with ${cols.length} collections and ${items.length} items.`);
  } catch (error) {
    console.error(`[SEED] Error seeding workspace ${workspaceId}:`, error.message);
    throw error;
  }
}

module.exports = {
  seedWorkspace
};
