// ═══════════════════════════════════════════════════════════════
// Vercel Serverless Function - Asset Library API
// Deploy: vercel.com (drag & drop or CLI)
// ═══════════════════════════════════════════════════════════════

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// In-memory storage (for demo - use DB in production)
// For persistent storage, use Vercel KV, MongoDB, or PostgreSQL
let assetsDB = {
  assets: [],
  nextId: 1
};

// Helper: Parse query parameters
function parseQuery(url) {
  const params = {};
  const searchParams = new URL(url, 'http://localhost').searchParams;
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  return params;
}

// Main handler
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  const { method } = req;

  try {
    // GET - List/Filter assets
    if (method === 'GET') {
      const query = parseQuery(req.url);
      let filtered = [...assetsDB.assets];

      // Filter by category
      if (query.cat && query.cat !== 'Hammasi' && query.cat !== 'All') {
        filtered = filtered.filter(a => a.mainCategory === query.cat);
      }

      // Filter by sub-category
      if (query.sub && query.sub !== 'Hammasi' && query.sub !== 'All') {
        filtered = filtered.filter(a => a.subCategory === query.sub);
      }

      // Search query
      if (query.q) {
        const q = query.q.toLowerCase();

        filtered = filtered.filter(a => {
          return a.name.toLowerCase().includes(q) ||
                 (Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q))) ||
                 (a.description && a.description.toLowerCase().includes(q));
        });
      }

      return res.status(200).json(filtered);
    }

    // POST - Add new asset
    if (method === 'POST') {
      const asset = req.body;
      
      // Validation
      if (!asset.name || !asset.cloudUrl) {
        return res.status(400).json({ error: 'Name and cloudUrl are required' });
      }

      const newAsset = {
        ...asset,
        id: assetsDB.nextId++,
        createdAt: Date.now()
      };

      assetsDB.assets.push(newAsset);
      return res.status(201).json(newAsset);
    }

    // PUT - Update asset
    if (method === 'PUT') {
      const asset = req.body;
      
      if (!asset.id) {
        return res.status(400).json({ error: 'Asset ID is required' });
      }

      const index = assetsDB.assets.findIndex(a => a.id === asset.id);
      if (index === -1) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      assetsDB.assets[index] = {
        ...asset,
        updatedAt: Date.now()
      };

      return res.status(200).json(assetsDB.assets[index]);
    }

    // DELETE - Remove asset
    if (method === 'DELETE') {
      const query = parseQuery(req.url);
      const id = parseInt(query.id);

      if (!id) {
        return res.status(400).json({ error: 'Asset ID is required' });
      }

      const index = assetsDB.assets.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      assetsDB.assets.splice(index, 1);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Apply CORS headers to all responses
export const config = {
  api: {
    bodyParser: true
  }
};
