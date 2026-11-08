# Lab 3: Debugging Exercise Guide & Solutions

In Lab 3, students are presented with a broken version of the project containing 4 classic backend errors. Below is the comprehensive breakdown of each bug: symptoms, root cause, code snippet with the error, and the exact fix.

---

### Bug 1: Port Conflict (`EADDRINUSE`)

#### 1. Symptom & Error Log
```
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1898:14)
    at listenInCluster (node:net:1953:12)
    ...
code: 'EADDRINUSE',
errno: -4091,
syscall: 'listen',
address: '::',
port: 3000
```

#### 2. Root Cause
Another Node process, background server, or application is already listening on port `3000`. When Express attempts to bind `app.listen(3000)` without checking or allowing a configurable port, the operating system throws `EADDRINUSE`.

#### 3. Buggy Code
```javascript
// Hardcoded port, no environment fallback, crashes immediately
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 4. The Fix
1. Read port dynamically from `.env` using `process.env.PORT || 3000`.
2. Add an `'error'` event listener to the HTTP server instance to handle `EADDRINUSE` gracefully with actionable instructions:
```javascript
// In src/server.js
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please change PORT in .env (e.g. PORT=3001) or kill the running process.`);
  }
  process.exit(1);
});
```
3. Alternatively, find and terminate the occupying process on Windows:
   `netstat -ano | findstr :3000` followed by `taskkill /PID <PID> /F`.

---

### Bug 2: Wrong Import / Module Path

#### 1. Symptom & Error Log
```
node:internal/modules/cjs/loader:1225
  const err = new Error(message);
        ^
Error: Cannot find module '../database/connection'
Require stack:
- C:\...\Lab 3\src\routes\books.js
```

#### 2. Root Cause
Relative path depth mismatch in CommonJS `require()`. In `src/routes/books.js`, referencing `../database/connection` only steps up one directory into `src/`, rather than `../../database/connection` to reach the project root.

#### 3. Buggy Code
```javascript
// Inside src/routes/books.js
const { getDatabaseConnection } = require('../database/connection'); // WRONG: looks in src/database/
```

#### 4. The Fix
Correct the relative traversal:
```javascript
// Inside src/routes/books.js
const { getDatabaseConnection } = require('../../database/connection'); // CORRECT: steps up out of routes/, out of src/
```

---

### Bug 3: Table-Name Typo (`no such table`)

#### 1. Symptom & Error Log
```
SQLITE_ERROR: no such table: book
    at Database.run (...)
    at ...
```

#### 2. Root Cause
The database schema initializes the table as plural `books` (`CREATE TABLE IF NOT EXISTS books (...)`), but a query inside a route references the singular name `book` (or miscapitalized `Books_table`).

#### 3. Buggy Code
```javascript
router.get('/', async (req, res, next) => {
  try {
    const db = await getDatabaseConnection();
    // Typo: 'book' instead of 'books'
    const books = await db.all('SELECT * FROM book;');
    res.json(books);
  } catch (error) {
    next(error);
  }
});
```

#### 4. The Fix
Synchronize SQL table identifiers with the schema definition in `database/connection.js`:
```javascript
router.get('/', async (req, res, next) => {
  try {
    const db = await getDatabaseConnection();
    // Correct table name: books
    const books = await db.all('SELECT * FROM books;');
    res.json(books);
  } catch (error) {
    next(error);
  }
});
```

---

### Bug 4: Missing `await` in Database Operations

#### 1. Symptom & Error Log
- The endpoint sends an empty object `{}` or `Promise { <pending> }` in the JSON response.
- Or subsequent statements execute before the row is created/queried, causing inconsistent race conditions or missing IDs:
```json
{
  "message": "Book created successfully",
  "book": undefined
}
```

#### 2. Root Cause
Database driver methods (`db.all()`, `db.get()`, `db.run()`, `db.prepare()`) return JavaScript `Promise` objects. When `await` is omitted in an `async` route handler, the code does not pause for the asynchronous SQLite operation to finish. Instead, it immediately proceeds to the next line with an unresolved `Promise`.

#### 3. Buggy Code
```javascript
router.get('/:id', async (req, res, next) => {
  try {
    const db = await getDatabaseConnection();
    // Missing 'await'!
    const book = db.get('SELECT * FROM books WHERE id = ?;', [req.params.id]);
    
    // book is a Promise { <pending> }, which is truthy!
    if (!book) { 
      return res.status(404).json({ message: 'Book not found' });
    }
    // Serializing a Promise produces {} instead of the record
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
});
```

#### 4. The Fix
Always `await` every asynchronous database operation:
```javascript
router.get('/:id', async (req, res, next) => {
  try {
    const db = await getDatabaseConnection();
    // Correct: await the Promise to resolve to the actual row object
    const book = await db.get('SELECT * FROM books WHERE id = ?;', [req.params.id]);
    
    if (!book) {
      return res.status(404).json({ message: `Book with ID ${req.params.id} not found.` });
    }
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
});
```

