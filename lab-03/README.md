# Lab 3: REST API, Query Parameters, Validation & Debugging

Name = Nirupadish Gouda
Reg No. = 252U1R1169

Backend Development Fundamentals (BDF) · Year II Term II · Aurora  
Faculty: Shiva Sai Tejs

---

## 📌 Project Overview
This project upgrades basic CRUD routes into a production-grade, secure RESTful API for a Books catalog using **Node.js**, **Express.js**, and **SQLite3**.

### Key Features
- **RESTful Resource Endpoints**: Standard plural noun conventions (`/books`) using appropriate HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
- **Advanced Query Parameters**:
  - `search_q`: Partial title search with SQL `LIKE %...%`.
  - `order_by` & `order`: Column sorting (`ASC`/`DESC`) with strict whitelist validation.
  - `limit` & `offset`: Pagination with default fallbacks.
  - `min_price` & `max_price`: Price range filtering using `BETWEEN` and comparison operators.
- **Robust Input Validation & Error Handling**:
  - Rejects missing `title`, `author`, or invalid `price` with **400 Bad Request**.
  - Consistent JSON response format: `{ "message": "..." }`.
  - Proper HTTP status codes: `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`.
- **Database Security**: 100% parameterized SQL queries preventing SQL injection vulnerabilities.
- **Debugging & Reliability**: Graceful handling of port conflicts (`EADDRINUSE`), path resolution, table naming, and asynchronous `await` synchronization.

---

## 📂 Project Structure

```
Lab 3/
├── .env.example                         # Template environment variables
├── .env                                 # Local environment config (git-ignored)
├── .gitignore                           # Excludes node_modules, .env, *.db
├── package.json                         # Project metadata, scripts, and dependencies
├── database/
│   ├── connection.js                    # SQLite connection & table initialization
│   ├── seed.js                          # Database seeder with sample books
│   └── books.db                         # SQLite database file
├── src/
│   ├── app.js                           # Express application & middleware assembly
│   ├── server.js                        # HTTP server entry point with EADDRINUSE handling
│   ├── routes/
│   │   └── books.js                     # RESTful /books route handlers
│   └── middleware/
│       ├── validator.js                 # Validation middleware for body and queries
│       └── errorHandler.js              # Centralized 404 & error formatters
└── tests/
    ├── test_runner.js                   # Automated 16-point in-process test suite
    ├── lab3_postman_collection.json     # Postman collection with test assertions
    └── debugging_guide.md               # Solutions for the 4 lab debugging challenges
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (verified on v24)
- **npm**: v9+

### 2. Installation
Install the required packages:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=3000
NODE_ENV=development
DB_PATH=./database/books.db
```

### 4. Seed Database
Populate the SQLite database with sample books:
```bash
npm run seed
```

### 5. Start Application
To run the server:
```bash
npm start
```
For active development with auto-reload:
```bash
npm run dev
```

---

## 🧪 Testing

Run the automated test runner covering all 16 success and failure assertions:
```bash
npm test
```

### Postman Collection
Import [`tests/lab3_postman_collection.json`](file:///c:/Users/niru7/OneDrive/Desktop/Lab%203/tests/lab3_postman_collection.json) into Postman:
1. Open Postman $\to$ Click **Import**.
2. Select `tests/lab3_postman_collection.json`.
3. Set the `baseUrl` variable (default: `http://localhost:3000`).
4. Run the collection to verify all 15+ automated assertions.

---

## 📖 API Reference

### Base URL: `http://localhost:3000/books`

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/books` | Retrieve list of books (supports filtering, sorting, pagination) | `200`, `400` |
| **GET** | `/books/:id` | Retrieve single book by ID | `200`, `400`, `404` |
| **POST** | `/books` | Create a new book | `201`, `400` |
| **PUT** | `/books/:id` | Update an existing book | `200`, `400`, `404` |
| **DELETE**| `/books/:id` | Delete a book by ID | `200`, `400`, `404` |

### Query Parameters for `GET /books`

| Parameter | Type | Default | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `search_q` | string | `""` | Partial title search using SQL `LIKE` | `/books?search_q=Clean` |
| `min_price`| number | `none` | Filter books with price $\ge$ `min_price` | `/books?min_price=30` |
| `max_price`| number | `none` | Filter books with price $\le$ `max_price` | `/books?max_price=60` |
| `order_by` | string | `'id'` | Sort column (`id`, `title`, `author`, `price`, `created_at`) | `/books?order_by=price` |
| `order` | string | `'ASC'` | Sort direction (`ASC` or `DESC`) | `/books?order=DESC` |
| `limit` | integer| `10` | Maximum records per page | `/books?limit=5` |
| `offset` | integer| `0` | Offset / pagination skip count | `/books?offset=0` |

---

## 🛠️ Debugging Exercise Solutions

The lab includes 4 debugging exercises. Detailed walkthroughs and code snippets are documented in [`tests/debugging_guide.md`](file:///c:/Users/niru7/OneDrive/Desktop/Lab%203/tests/debugging_guide.md):

1. **Port Conflict (`EADDRINUSE`)**: Resolved by dynamic `process.env.PORT` fallback and server error listeners.
2. **Wrong Import Path**: Fixed relative path traversal from `../database/connection` to `../../database/connection`.
3. **Table-Name Typo (`no such table`)**: Fixed SQL query mismatches (`book` vs `books`).
4. **Missing `await`**: Added `await` to asynchronous database calls (`db.get()`, `db.run()`, `db.all()`).

---

## 🎓 Viva Questions & Answers

### 1. What is the difference between a query parameter and a path parameter?
- **Path parameters** (`/books/:id`) are part of the URL path used to identify a specific, unique resource instance.
- **Query parameters** (`/books?search_q=Clean&limit=5`) appear after the `?` and are used to sort, filter, paginate, or customize how resources are presented.

### 2. What does stateless mean in RESTful API design?
Statelessness means that every request from the client to the server must contain all the information necessary to understand and process the request. The server does not store any client session state between requests.

### 3. Which HTTP status code should be returned for bad input vs a missing record?
- **Bad / Invalid Input**: `400 Bad Request` (client provided missing, malformed, or invalid fields).
- **Missing Record**: `404 Not Found` (the request was valid, but the specified resource ID does not exist).

### 4. Why are parameterized queries mandatory?
Parameterized queries strictly separate SQL executable logic from user-provided data parameters. The database engine compiles the SQL query structure first and treats user parameters strictly as literals, eliminating SQL Injection vulnerabilities.

---

## 🔒 Lab Rules Compliance Checklist
- [x] **No `.env` committed**: `.gitignore` strictly excludes `.env` and `node_modules/`.
- [x] **No plain-text credentials**: Passwords/secrets are never stored or logged in plain text.
- [x] **Proper Status Codes**: `200`, `201`, `400`, `404`, and `500` accurately assigned across all routes.
- [x] **Parameterized Queries**: 100% parameterization (`?`) used in all database queries.

