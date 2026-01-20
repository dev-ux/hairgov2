// api/index.js - Version pour Vercel serverless
const app = require('../server');

// Export pour Vercel
module.exports = (req, res) => {
  app(req, res);
};
