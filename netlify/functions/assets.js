// ═══════════════════════════════════════════════════════════════
// Netlify Serverless Function - Asset Library API
// ═══════════════════════════════════════════════════════════════

// In-memory database
let assetsDB = {
  assets: [],
  nextId: 1
};

// Main handler for Netlify
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true })
    };
  }

  const { httpMethod, queryStringParameters, body } = event;

  try {
    // GET - List/Filter assets
    if (httpMethod === 'GET') {
      let filtered = [...assetsDB.assets];

      // Filter by category
      if (queryStringParameters?.cat && queryStringParameters.cat !== 'All') {
        filtered = filtered.filter(a => a.mainCategory === queryStringParameters.cat);
      }

      // Filter by sub-category
      if (queryStringParameters?.sub && queryStringParameters.sub !== 'All') {
        filtered = filtered.filter(a => a.subCategory === queryStringParameters.sub);
      }

      // Search query
      if (queryStringParameters?.q) {
        const q = queryStringParameters.q.toLowerCase();
        filtered = filtered.filter(a => {
          return a.name.toLowerCase().includes(q) ||
                 (Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q))) ||
                 (a.description && a.description.toLowerCase().includes(q));
        });
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(filtered)
      };
    }

    // POST - Add new asset
    if (httpMethod === 'POST') {
      const asset = JSON.parse(body);
      
      // Validation
      if (!asset.name || !asset.cloudUrl) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Name and cloudUrl are required' })
        };
      }

      const newAsset = {
        ...asset,
        id: assetsDB.nextId++,
        createdAt: Date.now()
      };

      assetsDB.assets.push(newAsset);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newAsset)
      };
    }

    // PUT - Update asset
    if (httpMethod === 'PUT') {
      const asset = JSON.parse(body);
      
      if (!asset.id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Asset ID is required' })
        };
      }

      const index = assetsDB.assets.findIndex(a => a.id === asset.id);
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Asset not found' })
        };
      }

      assetsDB.assets[index] = {
        ...asset,
        updatedAt: Date.now()
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(assetsDB.assets[index])
      };
    }

    // DELETE - Remove asset
    if (httpMethod === 'DELETE') {
      const id = parseInt(queryStringParameters?.id);

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Asset ID is required' })
        };
      }

      const index = assetsDB.assets.findIndex(a => a.id === id);
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Asset not found' })
        };
      }

      assetsDB.assets.splice(index, 1);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
