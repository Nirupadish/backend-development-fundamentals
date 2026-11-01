const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'books.db');
const PORT = process.env.PORT || 3000;
let db = null;

// ─────────────────────────────────────────────
// Initialize DB connection, then start server
// ─────────────────────────────────────────────
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error(`❌ DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// ─────────────────────────────────────────────
// GET /books/ — Retrieve all books
// ─────────────────────────────────────────────
app.get('/books/', async (req, res) => {
  try {
    const query = `SELECT * FROM book;`;
    const books = await db.all(query);
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
    const query = `SELECT * FROM book WHERE id = ?;`;
    const book = await db.get(query, [bookId]);

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
    const query = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;
    const result = await db.run(query, [title, author, price, pages]);
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
    const query = `
      UPDATE book
      SET title = ?,
          author = ?,
          price = ?,
          pages = ?
      WHERE id = ?;
    `;
    await db.run(query, [title, author, price, pages, bookId]);
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
    const query = `DELETE FROM book WHERE id = ?;`;
    await db.run(query, [bookId]);
    res.json({ message: 'Book Deleted Successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

