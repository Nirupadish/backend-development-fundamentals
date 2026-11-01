const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'books.db');
const PORT = process.env.PORT || 3000;
let db = null;
let server = null;

// ─────────────────────────────────────────────
// Initialize DB connection, then start server
// ─────────────────────────────────────────────
const initializeDBAndServer = async (port = PORT) => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    console.log('✅ Database connected successfully');

    return new Promise((resolve) => {
      server = app.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`);
        resolve(server);
      });
    });
  } catch (e) {
    console.error(`❌ DB Error: ${e.message}`);
    process.exit(1);
  }
};

// Auto-run if executed directly
if (require.main === module) {
  initializeDBAndServer();
}

// ─────────────────────────────────────────────
// GET / — Health check (required by Render)
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Lab 02 — SQLite CRUD API is running' });
});

// ─────────────────────────────────────────────
// GET /books/ — Retrieve all books
// ─────────────────────────────────────────────
app.get('/books/', async (req, res) => {
  try {
    const books = await db.all('SELECT * FROM book;');
    res.json(books);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
// GET /books/:bookId/ — Retrieve a single book
// ─────────────────────────────────────────────
app.get('/books/:bookId/', async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId]);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
// POST /books/ — Add a new book
// ─────────────────────────────────────────────
app.post('/books/', async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;
    const result = await db.run(
      'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
      [title, author, price, pages]
    );
    res.json({ bookId: result.lastID, message: 'Book Added Successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
// PUT /books/:bookId/ — Update an existing book
// ─────────────────────────────────────────────
app.put('/books/:bookId/', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;
    await db.run(
      'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
      [title, author, price, pages, bookId]
    );
    res.json({ message: 'Book Updated Successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /books/:bookId/ — Remove a book
// ─────────────────────────────────────────────
app.delete('/books/:bookId/', async (req, res) => {
  try {
    const { bookId } = req.params;
    await db.run('DELETE FROM book WHERE id = ?;', [bookId]);
    res.json({ message: 'Book Deleted Successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = {
  app,
  initializeDBAndServer,
  getDb: () => db,
  getServer: () => server
};
