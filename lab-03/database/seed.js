require('dotenv').config();
const { getDatabaseConnection } = require('./connection');

const sampleBooks = [
  { title: 'The Pragmatic Programmer', author: 'Andy Hunt, Dave Thomas', price: 49.99 },
  { title: 'Clean Code', author: 'Robert C. Martin', price: 42.50 },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', price: 55.00 },
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 89.95 },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 29.99 },
  { title: 'Node.js Design Patterns', author: 'Mario Casciaro', price: 39.50 },
  { title: 'Clean Architecture', author: 'Robert C. Martin', price: 44.00 },
  { title: 'Refactoring', author: 'Martin Fowler', price: 47.99 }
];

async function seed() {
  try {
    const db = await getDatabaseConnection();
    console.log('Connected to database for seeding...');

    // Clear existing records to ensure fresh reproducible state
    await db.run('DELETE FROM books;');
    await db.run('DELETE FROM sqlite_sequence WHERE name = "books";');

    const insertStmt = await db.prepare(
      'INSERT INTO books (title, author, price) VALUES (?, ?, ?);'
    );

    for (const book of sampleBooks) {
      await insertStmt.run(book.title, book.author, book.price);
    }
    await insertStmt.finalize();

    const countResult = await db.get('SELECT COUNT(*) AS total FROM books;');
    console.log(`Database seeded successfully! Total books inserted: ${countResult.total}`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed, sampleBooks };

