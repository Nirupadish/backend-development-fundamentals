// Automated route tester & status code logger for Lab 1
const { server } = require('./server');

const BASE_URL = 'http://localhost:3000';

const routesToTest = [
  { method: 'GET', path: '/', expectedStatus: 200, label: 'Root / Welcome Route' },
  { method: 'GET', path: '/about', expectedStatus: 200, label: 'About Route (Student Details)' },
  { method: 'GET', path: '/time', expectedStatus: 200, label: 'Time Route (Current Timestamp)' },
  { method: 'GET', path: '/unknown-route-test', expectedStatus: 404, label: '404 Unknown Route' }
];

async function runTests() {
  console.log('\n======================================================');
  console.log('       LAB 1: ROUTE TESTING & STATUS CODE LOGGING     ');
  console.log('======================================================\n');

  let allPassed = true;

  for (const route of routesToTest) {
    const url = `${BASE_URL}${route.path}`;
    try {
      const response = await fetch(url, { method: route.method });
      const status = response.status;
      const statusText = response.statusText;
      const contentType = response.headers.get('content-type') || '';
      
      let body;
      if (contentType.includes('application/json')) {
        body = JSON.stringify(await response.json(), null, 2);
      } else {
        body = await response.text();
      }

      const isMatch = status === route.expectedStatus;
      if (!isMatch) allPassed = false;

      console.log(`[${isMatch ? 'PASS' : 'FAIL'}] ${route.label}`);
      console.log(`  Target URL    : ${url}`);
      console.log(`  Method        : ${route.method}`);
      console.log(`  Status Code   : ${status} (${statusText})`);
      console.log(`  Content-Type  : ${contentType}`);
      console.log(`  Response Body :\n${body.split('\n').map(l => '    ' + l).join('\n')}\n`);
    } catch (err) {
      allPassed = false;
      console.error(`[ERROR] Failed to fetch ${url}:`, err.message);
    }
  }

  console.log('======================================================');
  if (allPassed) {
    console.log(' ALL ENDPOINT TESTS PASSED WITH CORRECT STATUS CODES! ');
  } else {
    console.log(' SOME TESTS FAILED. ');
  }
  console.log('======================================================\n');

  // Close the server cleanly so test process exits
  server.close(() => {
    console.log('[Server Closed cleanly]');
  });
}

// Give server a brief moment to bind, then run tests
setTimeout(runTests, 500);
