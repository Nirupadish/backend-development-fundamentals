# Lab 2: SQLite Database and CRUD Routes

**Name:** Nirupadish Gouda  
**Registration Number:** 252U1R1169  
**Section:** CSE 2D  
**Instructor:** Shiva Sai Teja  

**Live Link:** <!-- Paste your Render/Railway/NxtWave URL here, or write "Not applicable — see Postman screenshots below" -->

---

## How to Run

### Prerequisites
- Node.js v18+
- SQLite3 CLI

### Install dependencies
```bash
cd lab-02
npm install
```

### Set up the database
```bash
sqlite3 books.db < seed.sql
```
> This creates the `books.db` file and inserts 10 sample book rows.

### Start the server
```bash
npm start          # uses nodemon (auto-restarts on changes)
# or
node index.js      # plain node
```

The server will start at **http://localhost:3000**

> **Environment variables:** None required for this lab.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/books/` | Returns all books in the database |
| `GET` | `/books/:bookId/` | Returns a single book by its ID |
| `POST` | `/books/` | Adds a new book (JSON body required) |
| `PUT` | `/books/:bookId/` | Updates an existing book by ID (JSON body required) |
| `DELETE` | `/books/:bookId/` | Deletes a book by its ID |

### Request Body (POST / PUT)
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

### GET /books/ — All Books
![GET all books](screenshots/get-all.png)

### GET /books/:bookId/ — Single Book
![GET single book](screenshots/get-one.png)

### POST /books/ — Add a Book
![POST book](screenshots/post.png)

### PUT /books/:bookId/ — Update a Book
![PUT book](screenshots/put.png)

### DELETE /books/:bookId/ — Delete a Book
![DELETE book](screenshots/delete.png)

---

## Notes

<!-- Describe any problems you faced and how you solved them -->
- ...

