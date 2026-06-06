require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Schema definitions inside the script to keep it standalone for Github Actions execution
const CollectionSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true },
  name: { type: String, required: true },
  parentCollectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
  createdAt: { type: Date, default: Date.now }
});

const ItemSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  embedUrl: { type: String },
  tags: [{ type: String }],
  note: { type: String },
  pinned: { type: Boolean, default: false },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', default: null },
  createdAt: { type: Date, default: Date.now }
});

// Avoid model compilation error if already defined in mongoose cache
const Collection = mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);
const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

async function runBackup() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);
    console.log('Connected successfully. Fetching data...');

    // Fetch collections and items, excluding demo data
    const nonDemoFilter = { workspaceId: { $not: /^demo_ws_/ } };
    
    const collections = await Collection.find(nonDemoFilter).lean();
    const items = await Item.find(nonDemoFilter).lean();

    console.log(`Retrieved ${collections.length} collections and ${items.length} items.`);

    const backupData = {
      backupDate: new Date().toISOString(),
      collections,
      items
    };

    // Ensure backups folder exists (at the repo root level)
    // The script runs from the repository root
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFilePath = path.join(backupDir, 'backup.json');
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
    
    console.log(`Backup written successfully to: ${backupFilePath}`);
  } catch (error) {
    console.error('Backup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

runBackup();
