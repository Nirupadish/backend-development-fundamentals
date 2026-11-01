/**
 * test.js — Full project test suite for Lab 2
 * Run: node test.js
 */
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const PASS = '[PASS]';
const FAIL = '[FAIL]';
let allPassed = true;

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ${PASS} ${label}${detail ? ' — ' + detail : ''}`);
  } else {
    console.log(`  ${FAIL} ${label}${detail ? ' — ' + detail : ''}`);
    allPassed = false;
  }
}

(async () => {
  console.log('');
  console.log('============================================');
  console.log('   LAB 2 — FULL PROJECT TEST SUITE');
  console.log('   Student : Nirupadish Gouda');
  console.log('   Reg No  : 252U1R1169 | Section: CSE 2D');
  console.log('   Instr   : Shiva Sai Teja');
  console.log('============================================');

  // ── FILE CHECKS ──────────────────────────────
  console.log('\n── FILE CHECKS ──────────────────────────────');
  const base = __dirname;
  check('index.js exists',       fs.existsSync(path.join(base, 'index.js')));
  check('package.json exists',   fs.existsSync(path.join(base, 'package.json')));
  check('.gitignore exists',     fs.existsSync(path.join(base, '.gitignore')));
  check('books.db exists',       fs.existsSync(path.join(base, 'books.db')));
  check('README.md exists',      fs.existsSync(path.join(base, 'README.md')));
  check('seed.sql exists',       fs.existsSync(path.join(base, 'seed.sql')));
  check('setup.js exists',       fs.existsSync(path.join(base, 'setup.js')));
  check('screenshots/ exists',   fs.existsSync(path.join(base, 'screenshots')));
  check('node_modules exists',   fs.existsSync(path.join(base, 'node_modules')));

  // ── .gitignore CHECKS ──────────────────────────
  console.log('\n── .GITIGNORE CHECKS ────────────────────────');
  const gitignore = fs.readFileSync(path.join(base, '.gitignore'), 'utf-8');
  check('node_modules/ in .gitignore', gitignore.includes('node_modules/'));
  check('.env in .gitignore',          gitignore.includes('.env'));

  // ── README CHECKS ───────────────────────────────
  console.log('\n── README.md CHECKS ─────────────────────────');
  const readme = fs.readFileSync(path.join(base, 'README.md'), 'utf-8');
  check('Name in README',       readme.includes('Nirupadish Gouda'));
  check('Reg No in README',     readme.includes('252U1R1169'));
  check('Section in README',    readme.includes('CSE 2D'));
  check('Instructor in README', readme.includes('Shiva Sai Teja'));
  check('GET /books/ endpoint documented',      readme.includes('GET') && readme.includes('/books/'));
  check('POST /books/ endpoint documented',     readme.includes('POST'));
  check('PUT /books/:bookId/ documented',       readme.includes('PUT'));
  check('DELETE /books/:bookId/ documented',    readme.includes('DELETE'));

  // ── DATABASE CHECKS ─────────────────────────────
  console.log('\n── DATABASE & CRUD CHECKS ───────────────────');
  const db = await open({ filename: path.join(base, 'books.db'), driver: sqlite3.Database });
  check('DB connection opened', !!db);

  const tbl = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='book';");
  check('book table exists', !!tbl);

  const { cnt } = await db.get('SELECT COUNT(*) AS cnt FROM book;');
  check('At least 8 rows seeded', cnt >= 8, `${cnt} rows found`);

  // GET all
  const books = await db.all('SELECT * FROM book;');
  check('GET all — returns array', Array.isArray(books), `${books.length} books`);

  // GET one
  const one = await db.get('SELECT * FROM book WHERE id = ?;', [1]);
  check('GET one — id=1 found', !!one, one ? one.title : 'not found');

  // POST
  const ins = await db.run('INSERT INTO book (title,author,price,pages) VALUES (?,?,?,?);',
    ['Test Book', 'Test Author', 199, 100]);
  check('POST — insert returns lastID', !!ins.lastID, `id=${ins.lastID}`);

  // PUT
  await db.run('UPDATE book SET title=?,author=?,price=?,pages=? WHERE id=?;',
    ['Updated Title', 'Updated Author', 299, 200, ins.lastID]);
  const updated = await db.get('SELECT * FROM book WHERE id=?;', [ins.lastID]);
  check('PUT — title updated', updated && updated.title === 'Updated Title', updated ? updated.title : 'not found');

  // DELETE
  await db.run('DELETE FROM book WHERE id=?;', [ins.lastID]);
  const deleted = await db.get('SELECT * FROM book WHERE id=?;', [ins.lastID]);
  check('DELETE — row removed', !deleted);

  // 404 case
  const notFound = await db.get('SELECT * FROM book WHERE id=?;', [9999]);
  check('404 case — undefined for missing id', notFound === undefined);

  // Row count unchanged after test cycle
  const { cnt: finalCnt } = await db.get('SELECT COUNT(*) AS cnt FROM book;');
  check('Row count back to original after test', finalCnt === cnt, `${finalCnt} rows`);

  await db.close();

  // ── index.js CONTENT CHECKS ─────────────────────
  console.log('\n── index.js CONTENT CHECKS ──────────────────');
  const src = fs.readFileSync(path.join(base, 'index.js'), 'utf-8');
  check('initializeDBAndServer defined',   src.includes('initializeDBAndServer'));
  check('async/await used',                src.includes('async') && src.includes('await'));
  check('GET /books/ route',               src.includes("app.get('/books/'"));
  check('GET /books/:bookId/ route',       src.includes("app.get('/books/:bookId/'"));
  check('POST /books/ route',              src.includes("app.post('/books/'"));
  check('PUT /books/:bookId/ route',       src.includes("app.put('/books/:bookId/'"));
  check('DELETE /books/:bookId/ route',    src.includes("app.delete('/books/:bookId/'"));
  check('Parameterised queries used (?)',  src.includes('?'));
  check('express.json() middleware',       src.includes('express.json()'));
  check('error handling (try/catch)',      src.includes('try {') && src.includes('catch'));

  // ── SUMMARY ─────────────────────────────────────
  console.log('');
  console.log('============================================');
  if (allPassed) {
    console.log('  ALL TESTS PASSED — Lab 2 is ready!');
    console.log('  Next step: run "npm start", test in');
    console.log('  Postman, add screenshots, push to GitHub.');
  } else {
    console.log('  SOME TESTS FAILED — check output above.');
  }
  console.log('============================================');
  console.log('');

  if (!allPassed) process.exit(1);
})().catch(e => {
  console.error('\n[FAIL] Unexpected error:', e.message);
  process.exit(1);
});

