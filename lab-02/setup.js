/**
 * setup.js — Run once to create the database and seed 10 books.
 * Usage: node setup.js
 */
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'books.db');

(async () => {
  const db = await open({ filename: dbPath, driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS book (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      title  TEXT    NOT NULL,
      author TEXT    NOT NULL,
      price  INTEGER NOT NULL,
      pages  INTEGER NOT NULL
    );
  `);

  // Only seed if the table is empty
  const count = await db.get(`SELECT COUNT(*) AS cnt FROM book;`);
  if (count.cnt === 0) {
    await db.exec(`
      INSERT INTO book (title, author, price, pages) VALUES
        ('The Pragmatic Programmer', 'Andrew Hunt', 499, 352),
        ('Clean Code', 'Robert C. Martin', 399, 431),
        ('You Don''t Know JS', 'Kyle Simpson', 299, 278),
        ('Eloquent JavaScript', 'Marijn Haverbeke', 350, 472),
        ('Node.js Design Patterns', 'Mario Casciaro', 599, 660),
        ('Learning SQL', 'Alan Beaulieu', 299, 338),
        ('Database Internals', 'Alex Petrov', 699, 373),
        ('Express in Action', 'Evan Hahn', 349, 256),
        ('JavaScript: The Good Parts', 'Douglas Crockford', 249, 176),
        ('Pro Git', 'Scott Chacon', 0, 574);
    `);
    console.log('✅ Database seeded with 10 books.');
  } else {
    console.log(`ℹ️  Database already has ${count.cnt} books. Skipping seed.`);
  }

  const books = await db.all(`SELECT * FROM book;`);
  console.log('\n📚 Books in database:');
  console.table(books);

  await db.close();
})();

