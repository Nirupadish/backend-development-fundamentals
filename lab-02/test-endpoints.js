// Automated route tester & status code logger for Lab 2
const { initializeDBAndServer, getDb } = require('./index');

const TEST_PORT = 3001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runTests() {
  console.log('\n======================================================');
  console.log('       LAB 2: ROUTE TESTING & STATUS CODE LOGGING     ');
  console.log('       Student: Nirupadish Gouda | CSE 2D             ');
  console.log('======================================================\n');

  let server;
  try {
    server = await initializeDBAndServer(TEST_PORT);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }

  let allPassed = true;
  let testBookId = null;

  const testSteps = [
    {
      name: 'Root / Health Check Route',
      method: 'GET',
      path: '/',
      expectedStatus: 200,
      body: null
    },
    {
      name: 'GET All Books',
      method: 'GET',
      path: '/books/',
      expectedStatus: 200,
      body: null
    },
    {
      name: 'GET Single Book (id=1)',
      method: 'GET',
      path: '/books/1/',
      expectedStatus: 200,
      body: null
    },
    {
      name: 'POST Add New Book',
      method: 'POST',
      path: '/books/',
      expectedStatus: 200,
      body: {
        title: 'System Design Interview',
        author: 'Alex Xu',
        price: 599,
        pages: 320
      }
    },
    {
      name: 'PUT Update Book',
      method: 'PUT',
      path: '/books/{id}/',
      expectedStatus: 200,
      body: {
        title: 'System Design Interview (2nd Edition)',
        author: 'Alex Xu',
        price: 649,
        pages: 340
      }
    },
    {
      name: 'DELETE Book',
      method: 'DELETE',
      path: '/books/{id}/',
      expectedStatus: 200,
      body: null
    },
    {
      name: 'GET Deleted / Not Found Book (id=9999)',
      method: 'GET',
      path: '/books/9999/',
      expectedStatus: 404,
      body: null
    }
  ];

  for (const step of testSteps) {
    let resolvedPath = step.path;
    if (resolvedPath.includes('{id}')) {
      resolvedPath = resolvedPath.replace('{id}', testBookId || '1');
    }

    const url = `${BASE_URL}${resolvedPath}`;
    const options = {
      method: step.method,
      headers: step.body ? { 'Content-Type': 'application/json' } : {}
    };
    if (step.body) {
      options.body = JSON.stringify(step.body);
    }

    try {
      const response = await fetch(url, options);
      const status = response.status;
      const statusText = response.statusText;
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (step.method === 'POST' && data && data.bookId) {
        testBookId = data.bookId;
      }

      const isMatch = status === step.expectedStatus;
      if (!isMatch) allPassed = false;

      const formattedBody = typeof data === 'object'
        ? JSON.stringify(data, null, 2)
        : String(data);

      console.log(`[${isMatch ? 'PASS' : 'FAIL'}] ${step.name}`);
      console.log(`  Target URL    : ${url}`);
      console.log(`  Method        : ${step.method}`);
      console.log(`  Status Code   : ${status} (${statusText})`);
      console.log(`  Content-Type  : ${contentType}`);
      console.log(`  Response Body :\n${formattedBody.split('\n').map(l => '    ' + l).join('\n')}\n`);
    } catch (err) {
      allPassed = false;
      console.error(`[ERROR] Failed to execute ${step.method} ${url}:`, err.message);
    }
  }

  console.log('======================================================');
  if (allPassed) {
    console.log(' ALL 7 ROUTE TESTS PASSED WITH CORRECT STATUS CODES! ');
  } else {
    console.log(' SOME TESTS FAILED. ');
  }
  console.log('======================================================\n');

  // Clean shutdown without triggering libuv assertion
  const db = getDb();
  if (db) {
    try {
      await db.close();
    } catch (e) {
      // ignore
    }
  }

  server.close(() => {
    console.log('[Server Closed cleanly]');
  });
}

runTests();
