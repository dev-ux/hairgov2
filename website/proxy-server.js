// Proxy temporaire pour contourner le problème CORS
// À lancer avec: node proxy-server.js

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3003;
const BACKEND_URL = 'https://hairgov2.onrender.com';

// CORS middleware pour le proxy
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3002');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Proxy vers le backend
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // Garde le chemin /api
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('🔄 Proxy request:', req.method, req.url);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 Proxy server démarré sur http://localhost:${PORT}`);
  console.log(`📡 Redirection vers: ${BACKEND_URL}`);
  console.log(`🌐 Frontend peut maintenant utiliser: http://localhost:${PORT}`);
});

module.exports = app;
