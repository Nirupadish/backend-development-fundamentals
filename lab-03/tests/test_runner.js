const { EventEmitter } = require('events');
const app = require('../src/app');
const { seed } = require('../database/seed');

function makeRequest(method, url, body = null) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = {
      'content-type': 'application/json',
      host: 'localhost'
    };

    let statusCode = 200;
    const responseHeaders = {};
    let responseBody = '';

    const res = {
      statusCode: 200,
      status(code) {
        statusCode = code;
        this.statusCode = code;
        return this;
      },
      setHeader(k, v) {
        responseHeaders[k.toLowerCase()] = v;
      },
      getHeader(k) {
        return responseHeaders[k.toLowerCase()];
      },
      send(data) {
        responseBody = data;
        this.end();
      },
      json(data) {
        this.setHeader('content-type', 'application/json');
        responseBody = JSON.stringify(data);
        this.end();
      },
      end(chunk) {
        if (chunk) {
          responseBody = chunk;
        }
        let parsed;
        try {
          parsed = JSON.parse(responseBody);
        } catch (e) {
          parsed = responseBody;
        }
        resolve({
          status: statusCode,
          headers: responseHeaders,
          body: parsed
        });
      }
    };

    // If body exists, parse into req.body (or let express.json handle if body is streamed)
    if (body) {
      req.body = body;
    }

    app(req, res);
  });
}

async function runTests() {
  console.log('--- Starting Lab 3 REST API Test Suite (In-Process) ---');
  await seed();

  let passed = 0;
  let failed = 0;

  function assert(testName, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  // 1. GET /books (default params)
  const res1 = await makeRequest('GET', '/books');
  assert('1. GET /books returns 200 and array of books', res1.status === 200 && Array.isArray(res1.body));
  assert('1b. Default returns seeded books count', res1.body.length === 8);

  // 2. GET /books?search_q=Clean
  const res2 = await makeRequest('GET', '/books?search_q=Clean');
  assert('2. GET /books?search_q=Clean returns matching titles (2 books)',
    res2.status === 200 && res2.body.length === 2 && res2.body.every(b => b.title.includes('Clean'))
  );

  // 3. GET /books?min_price=40&max_price=50
  const res3 = await makeRequest('GET', '/books?min_price=40&max_price=50');
  assert('3. GET /books with price range filter returns books between 40 and 50',
    res3.status === 200 && res3.body.length > 0 && res3.body.every(b => b.price >= 40 && b.price <= 50)
  );

  // 4. GET /books?order_by=price&order=DESC&limit=3
  const res4 = await makeRequest('GET', '/books?order_by=price&order=DESC&limit=3');
  assert('4. GET /books sorting by price DESC with limit 3',
    res4.status === 200 && res4.body.length === 3 && res4.body[0].price >= res4.body[1].price
  );

  // 5. GET /books/:id (success)
  const res5 = await makeRequest('GET', '/books/1');
  assert('5. GET /books/1 returns 200 and single book object',
    res5.status === 200 && res5.body.id === 1 && res5.body.title
  );

  // 6. GET /books/9999 (not found)
  const res6 = await makeRequest('GET', '/books/9999');
  assert('6. GET /books/9999 returns 404 with error message',
    res6.status === 404 && typeof res6.body.message === 'string'
  );

  // 7. POST /books (success 201)
  const newBookPayload = {
    title: 'Site Reliability Engineering',
    author: 'Betsy Beyer et al.',
    price: 52.00
  };
  const res7 = await makeRequest('POST', '/books', newBookPayload);
  assert('7. POST /books creates book with status 201',
    res7.status === 201 && res7.body.book && res7.body.book.title === newBookPayload.title
  );
  const createdId = res7.body.book.id;

  // 8. POST /books (failure missing title)
  const res8 = await makeRequest('POST', '/books', { author: 'No Title Author', price: 25 });
  assert('8. POST /books missing title returns 400',
    res8.status === 400 && res8.body.message.includes('title')
  );

  // 9. POST /books (failure missing author)
  const res9 = await makeRequest('POST', '/books', { title: 'No Author Title', price: 25 });
  assert('9. POST /books missing author returns 400',
    res9.status === 400 && res9.body.message.includes('author')
  );

  // 10. POST /books (failure non-numeric price)
  const res10 = await makeRequest('POST', '/books', { title: 'Bad Price Book', author: 'Author', price: 'not-a-number' });
  assert('10. POST /books non-numeric price returns 400',
    res10.status === 400 && res10.body.message.includes('price')
  );

  // 11. PUT /books/:id (success 200)
  const updatePayload = {
    title: 'Site Reliability Engineering (2nd Ed)',
    author: 'Google SRE Team',
    price: 58.00
  };
  const res11 = await makeRequest('PUT', `/books/${createdId}`, updatePayload);
  assert('11. PUT /books/:id updates existing book and returns 200',
    res11.status === 200 && res11.body.book && res11.body.book.title === updatePayload.title
  );

  // 12. PUT /books/9999 (not found 404)
  const res12 = await makeRequest('PUT', '/books/9999', updatePayload);
  assert('12. PUT /books/9999 returns 404',
    res12.status === 404 && typeof res12.body.message === 'string'
  );

  // 13. DELETE /books/:id (success 200)
  const res13 = await makeRequest('DELETE', `/books/${createdId}`);
  assert('13. DELETE /books/:id returns 200',
    res13.status === 200 && typeof res13.body.message === 'string'
  );

  // 14. DELETE /books/9999 (not found 404)
  const res14 = await makeRequest('DELETE', '/books/9999');
  assert('14. DELETE /books/9999 returns 404',
    res14.status === 404 && typeof res14.body.message === 'string'
  );

  // 15. Validation on query parameters (invalid order_by column)
  const res15 = await makeRequest('GET', '/books?order_by=malicious_col');
  assert('15. GET /books with invalid order_by column returns 400',
    res15.status === 400 && res15.body.message.includes('order_by')
  );

  console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
