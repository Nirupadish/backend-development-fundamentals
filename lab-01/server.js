// Lab 1: Node.js and Express server
// Student: Nirupadish Gouda
// Course: Backend Development Fundamentals

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON (good practice)
app.use(express.json());

// Route 1: GET / (welcome text)
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Backend Development Fundamentals Server!');
});

// Route 2: GET /about (JSON with name, registration number, and section)
app.get('/about', (req, res) => {
  res.status(200).json({
    name: 'Nirupadish Gouda',
    registrationNumber: '252U1R1169',
    section: 'CSE 2D',
    course: 'Backend Development Fundamentals',
    term: 'Year II Term II',
    faculty: 'Shiva Sai Teja'
  });
});

// Route 3: GET /time (current date and time using new Date())
app.get('/time', (req, res) => {
  const now = new Date();
  res.status(200).json({
    currentTime: now.toString(),
    iso: now.toISOString(),
    date: now.toDateString(),
    time: now.toTimeString()
  });
});

// 404 handler: Return a 404 message for any unknown path
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route '${req.originalUrl}' does not exist on this server.`,
    statusCode: 404
  });
});

// Start listening on port 3000
const server = app.listen(PORT, () => {
  console.log(`[Express Server] Server running successfully at http://localhost:${PORT}`);
  console.log(`- Welcome Route : http://localhost:${PORT}/`);
  console.log(`- About Route   : http://localhost:${PORT}/about`);
  console.log(`- Time Route    : http://localhost:${PORT}/time`);
  console.log(`- 404 Test      : http://localhost:${PORT}/unknown`);
});

module.exports = { app, server };
