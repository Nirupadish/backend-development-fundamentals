const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let dbInstance = null;

async function getDatabaseConnection() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.resolve(__dirname);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbFilePath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(dbDir, 'books.db');

  dbInstance = await open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await dbInstance.run('PRAGMA foreign_keys = ON;');

  // Initialize books table
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return dbInstance;
}

module.exports = {
  getDatabaseConnection,
};

