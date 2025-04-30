// Custom server implementation
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Ensure we're using proper environment variables
require('dotenv').config();

app.prepare().then(() => {
  createServer((req, res) => {
    // Parse the URL
    const parsedUrl = parse(req.url, true);
    
    // Let Next.js handle the request
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });
});
