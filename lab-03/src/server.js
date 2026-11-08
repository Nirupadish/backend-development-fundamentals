require('dotenv').config();
const app = require('./app');
const { getDatabaseConnection } = require('../database/connection');

const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;

async function startServer() {
  try {
    // Ensure database connection and tables are ready
    console.log('Initializing database connection...');
    await getDatabaseConnection();
    console.log('Database initialized successfully.');

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`Server is running on: http://localhost:${PORT}`);
      console.log(`API Base URL:        http://localhost:${PORT}/books`);
      console.log(`Environment:         ${process.env.NODE_ENV || 'development'}`);
      console.log(`===============================================`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n[Server Error - Port Conflict (EADDRINUSE)]`);
        console.error(`Port ${PORT} is already in use by another running process.`);
        console.error(`Solutions:`);
        console.error(` 1. Set a different port in your .env file (e.g. PORT=3001)`);
        console.error(` 2. Or terminate the process occupying port ${PORT}\n`);
      } else {
        console.error('[Server Error]', error.message);
      }
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };

