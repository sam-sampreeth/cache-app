require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { connectDb, isMemoryMode, cleanupMemoryDemos } = require('./db');
const { seedWorkspace } = require('./services/seeder');
const authMiddleware = require('./middleware/auth');

const workspaceRoutes = require('./routes/workspace');
const collectionRoutes = require('./routes/collection');
const itemRoutes = require('./routes/item');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cache-app';
const JWT_SECRET = process.env.JWT_SECRET || 'cache_secret_key';

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.) or matching allowed origins
    if (!origin || allowedOrigins.includes(origin) || process.env.ALLOW_ALL_CORS === 'true') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id']
}));

app.use(express.json());

// Auth routes (unprotected)
app.post('/api/auth/login', async (req, res) => {
  const { email, password, isDemo } = req.body;

  try {
    if (isDemo) {
      // Create a unique demo workspace ID
      const workspaceId = 'demo_ws_' + Math.random().toString(36).substring(2, 11);
      
      // Seed the workspace in memory
      await seedWorkspace(workspaceId);
      
      // Sign demo token (expires in 2 hours)
      const token = jwt.sign(
        { role: 'demo', workspaceId },
        JWT_SECRET,
        { expiresIn: '2h' }
      );
      
      return res.json({
        token,
        role: 'demo',
        workspaceId,
        expiresIn: '2h'
      });
    }

    // Admin authentication
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cache.app';
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (email !== adminEmail) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let isPasswordCorrect = false;

    // Check plain text env variable if set
    if (adminPassword && password === adminPassword) {
      isPasswordCorrect = true;
    }
    // Or check bcrypt hash if set
    else if (adminPasswordHash && bcrypt.compareSync(password, adminPasswordHash)) {
      isPasswordCorrect = true;
    }
    // Default fallback if no admin credentials configured in .env (for easier initial run)
    else if (!adminPassword && !adminPasswordHash && password === 'admin123') {
      console.warn('[SECURITY WARNING] Logging in using default credentials ("admin123"). Please configure ADMIN_PASSWORD in .env');
      isPasswordCorrect = true;
    }

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Admin workspace ID is fixed
    const workspaceId = 'admin_vault';

    // Sign admin token (expires in 7 days)
    const token = jwt.sign(
      { role: 'admin', workspaceId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      role: 'admin',
      workspaceId,
      expiresIn: '7d'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check (unprotected)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: isMemoryMode() ? 'memory_mock' : 'mongodb',
    time: new Date()
  });
});

// Public scrape endpoint — used by the landing page demo (no auth required)
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'URL is required' });
  }
  try {
    const { scrapeUrl } = require('./services/scraper');
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http')) finalUrl = `https://${finalUrl}`;
    const result = await scrapeUrl(finalUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protect other API routes
app.use('/api/workspace', authMiddleware, workspaceRoutes);
app.use('/api/collections', authMiddleware, collectionRoutes);
app.use('/api/items', authMiddleware, itemRoutes);

// Periodic In-Memory Demo Workspaces Cleanup (every 10 minutes)
const DEMO_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour
setInterval(() => {
  try {
    const report = cleanupMemoryDemos(DEMO_EXPIRATION_MS);
    if (report.collectionsDeleted > 0 || report.itemsDeleted > 0 || report.workspacesDeleted > 0) {
      console.log(`[CLEANUP] Automatically purged expired demo data:`, report);
    }
  } catch (err) {
    console.error('[CLEANUP ERROR] Failed to clean up memory demos:', err.message);
  }
}, 10 * 60 * 1000); // 10 minutes

// Connect to Database
connectDb(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    console.error('Critical: Database initialization failed:', err.message);
    process.exit(1);
  });
