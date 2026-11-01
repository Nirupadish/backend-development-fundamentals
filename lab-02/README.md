# Lab 2: SQLite Database and CRUD Routes

**Student Name**: Nirupadish Gouda  
**Registration Number**: 252U1R1169  
**Section**: CSE 2D  
**Course**: Backend Development Fundamentals (Year II Term II)  
**Faculty**: Shiva Sai Teja  

---

## Live Link

- **Render Live URL**: Not deployed yet — see Postman screenshots below.

> **Note:** To deploy, push this folder to a Render Web Service with `node index.js` as the start command.

---

## How to Run

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Installation

Navigate into the `lab-02` directory and install project dependencies:
```bash
cd lab-02
npm install
```

### 3. Database Setup

Run the setup script once to create `books.db` and seed 10 sample books:
```bash
node setup.js
```

> Alternatively, if you have the SQLite CLI installed:
> ```bash
> sqlite3 books.db < seed.sql
> ```

### 4. Environment Variables

- `PORT` (Optional): Network port for the server. Defaults to `3000` if not set.

### 5. Running the Server

```bash
npm start
```
*Uses nodemon — server auto-restarts on every file change.*

Alternatively:
```bash
node index.js
```

The server will start at `http://localhost:3000/`

---

## Explanation of `package.json` Fields

| Field | Purpose & Description |
| :--- | :--- |
| **`name`** | The project identifier (`"lab-02-sqlite-crud"`), lowercase and URL-friendly. |
| **`version`** | Semantic version of the project (`"1.0.0"`), following `MAJOR.MINOR.PATCH`. |
| **`description`** | Short description explaining the purpose — SQLite CRUD routes using Express. |
| **`main`** | Entry point script (`"index.js"`) executed when the server is started. |
| **`scripts`** | Custom CLI aliases: `setup` (seed DB), `start` (nodemon), `dev` (plain node). |
| **`author`** | Creator of the project (`"Nirupadish Gouda"`). |
| **`license`** | Legal license governing usage (`"ISC"`). |
| **`dependencies`** | Production packages: `express`, `sqlite`, `sqlite3` required at runtime. |
| **`devDependencies`** | Dev-only packages: `nodemon` for auto-restarting during development. |

---

## Endpoints Table

| Method | Path | Description | Expected Status Code | Response Type |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/books/` | Returns all books from the database | `200 OK` | `application/json` |
| `GET` | `/books/:bookId/` | Returns a single book by its ID | `200 OK` / `404 Not Found` | `application/json` |
| `POST` | `/books/` | Adds a new book (JSON body required) | `200 OK` | `application/json` |
| `PUT` | `/books/:bookId/` | Updates an existing book by ID (JSON body required) | `200 OK` | `application/json` |
| `DELETE` | `/books/:bookId/` | Deletes a book by its ID | `200 OK` | `application/json` |

### Request Body for POST / PUT

```json
{
  "title": "Book Title",
  "author": "Author Name",
  "price": 399,
  "pages": 300
}
```

---

## Screenshots

### 1. GET /books/ — All Books
Returns the full list of books from the database with status `200 OK`.
![GET all books](screenshots/get-all.png)

### 2. GET /books/:bookId/ — Single Book
Returns one book by ID with status `200 OK`.
![GET single book](screenshots/get-one.png)

### 3. POST /books/ — Add a Book
Inserts a new book row and returns the new `bookId` with status `200 OK`.
![POST book](screenshots/post.png)

### 4. PUT /books/:bookId/ — Update a Book
Updates the book fields by ID and returns a success message with status `200 OK`.
![PUT book](screenshots/put.png)

### 5. DELETE /books/:bookId/ — Delete a Book
Removes the book row by ID and returns a success message with status `200 OK`.
![DELETE book](screenshots/delete.png)

---

## Notes: Problems Faced and Solutions

1. **`initializeDBAndServer` pattern**:
   - *Reason*: The server must only start after the database connection succeeds. Starting the server before the DB is ready causes runtime errors on the first request.
   - *Solution*: Wrapped `open()` and `app.listen()` inside a single `async` function and called it at the top level, using `try/catch` to exit with a non-zero code on DB failure.

2. **SQLite CLI not found on Windows**:
   - *Problem*: `sqlite3` is not on the system PATH by default on Windows, so `sqlite3 books.db < seed.sql` fails.
   - *Solution*: Created `setup.js` — a Node.js script that uses the `sqlite` npm package to create the table and seed rows programmatically. Run with `node setup.js`.

3. **SQL Injection Prevention**:
   - *Problem*: Building SQL queries by concatenating user input (e.g., `` `SELECT * FROM book WHERE id = ${req.params.bookId}` ``) is vulnerable to SQL injection attacks.
   - *Solution*: Used parameterised queries with `?` placeholders and passed values as an array argument to `db.get()`, `db.all()`, and `db.run()`. The SQLite driver safely escapes all input.

---

## Viva Questions & Answers

### Q1: Why `await` the database call?
- **Answer**: Database operations are I/O-bound and asynchronous — they interact with the filesystem (reading/writing the `.db` file). Without `await`, the function returns immediately with a `Promise` object instead of the resolved data, causing the route handler to send an empty or undefined response. `await` suspends execution of the `async` function until the promise resolves and the actual data is available.

### Q2: What is SQL injection and how do placeholders prevent it?
- **Answer**: SQL injection is an attack where a malicious user embeds SQL commands inside input fields. For example, passing `id = 1 OR 1=1` in a URL could expose all rows. Parameterised queries (`?` placeholders) prevent this by separating SQL logic from user data — the SQLite driver treats the value as a literal string, never as executable SQL code.

### Q3: When is PUT used instead of POST?
- **Answer**: `POST` is used to **create** a new resource at a collection endpoint (e.g., `POST /books/` adds a new book). `PUT` is used to **replace or update** a specific, known resource (e.g., `PUT /books/1/` updates the book with `id = 1`). The key distinction is idempotency — calling `PUT` multiple times with the same data produces the same result, whereas repeated `POST` calls create multiple new records.
