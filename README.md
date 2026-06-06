# Cache

Cache is a personal digital archiving system. It lets you save, organize, and retrieve links, media embeds, and plain-text markdown notes.

The live application is hosted at:
https://cache.sampreeth.in

## Features

- Quick-add links and notes: Paste a URL or write a note directly into the dashboard.
- Auto-parsing: The backend automatically scrapes metadata and titles for added links.
- Interactive previews: Previews for YouTube, Spotify, Reddit, and Instagram items are rendered directly.
- Hierarchical collections: Organize items inside folders and subfolders.
- Tag indexing: Categorize items using tags and filter them instantly.
- Global search: Search by title, tag, note, description, or URL.
- Responsive design: Brutalist styled interface that scales well across mobile and desktop devices.
- Local and session storage: Respects your privacy and subdomain workspace limits by grouping settings under a single namespace.

## Tech Stack

- Frontend: React (Vite), Tailwind CSS (for layout utility classes), and Lucide React (for icons).
- Backend: Node.js, Express, and MongoDB (via Mongoose). Operates in an in-memory mock database mode when no database URI is supplied.

## Installation

### Prerequisites

You need Node.js and npm installed on your system.

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/sam-sampreeth/cache-app.git
   cd cache-app
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder and add:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/cache-app
   JWT_SECRET=your_jwt_secret
   ADMIN_EMAIL=admin@cache.app
   ADMIN_PASSWORD=admin123
   ```
   To run in mock database mode (in-memory, no MongoDB required), add `MOCK_DB=true` to the `.env` file.

3. Start the backend server:
   ```bash
   npm start
   ```

4. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` folder and add:
   ```env
   VITE_API_BASE=http://localhost:5000
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
