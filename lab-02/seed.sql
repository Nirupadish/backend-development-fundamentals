-- Lab 2: SQLite Database Setup
-- Run this file in the SQLite CLI:  sqlite3 books.db < seed.sql

CREATE TABLE IF NOT EXISTS book (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    title  TEXT    NOT NULL,
    author TEXT    NOT NULL,
    price  INTEGER NOT NULL,
    pages  INTEGER NOT NULL
);

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

