// Task: Write a plain server with http.createServer that replies "Hello" and listen on port 3000.
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Set response HTTP status and content type header
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  // Send "Hello" response body
  res.end('Hello');
});

server.listen(PORT, () => {
  console.log(`[HTTP Server] Plain Node.js server running on http://localhost:${PORT}`);
});
