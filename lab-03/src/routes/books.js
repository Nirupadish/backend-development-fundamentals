const express = require('express');
const router = express.Router();
const { getDatabaseConnection } = require('../../database/connection');
const {
  validateBookBody,
  validateQueryParams,
  validateBookId
} = require('../middleware/validator');

/**
 * GET /books
 * Supports search_q, min_price, max_price, order_by, order, limit, offset
 */
router.get('/', validateQueryParams, async (req, res, next) => {
  try {
    const db = await getDatabaseConnection();
    const {
      search_q,
      order_by,
      order,
      limit,
      offset,
      min_price,
      max_price
    } = req.validatedQuery;

    const conditions = [];
    const params = [];

    // Search partial title match with LIKE
    if (search_q && search_q.length > 0) {
      conditions.push('title LIKE ?');
      params.push(`%${search_q}%`);
    }

    // Price range filters using BETWEEN or comparative operators
    if (min_price !== null && max_price !== null) {
      conditions.push('price BETWEEN ? AND ?');
      params.push(min_price, max_price);
    } else if (min_price !== null) {
      conditions.push('price >= ?');
      params.push(min_price);
    } else if (max_price !== null) {
      conditions.push('price <= ?');
      params.push(max_price);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Parameterized LIMIT and OFFSET, whitelisted ORDER BY
    const query = `
      SELECT id, title, author, price, created_at
      FROM books
      ${whereClause}
      ORDER BY ${order_by} ${order}
      LIMIT ? OFFSET ?;
    `;

    params.push(limit, offset);

    const books = await db.all(query, params);
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /books/:id
 * Retrieves a single book by ID
 */
router.get('/:id', validateBookId, async (req, res, next) => {
  try {
    const db = await getDatabaseConnection();
    const book = await db.get(
      'SELECT id, title, author, price, created_at FROM books WHERE id = ?;',
      [req.bookId]
    );

    if (!book) {
      return res.status(404).json({
        message: `Book with ID ${req.bookId} not found.`
      });
    }

    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /books
 * Creates a new book
 * Rejects missing title, author, or non-numeric price with 400
 * Returns 201 Created on success
 */
router.post('/', validateBookBody, async (req, res, next) => {
  try {
    const db = await getDatabaseConnection();
    const { title, author, price } = req.body;

    const result = await db.run(
      'INSERT INTO books (title, author, price) VALUES (?, ?, ?);',
      [title, author, price]
    );

    const createdBook = await db.get(
      'SELECT id, title, author, price, created_at FROM books WHERE id = ?;',
      [result.lastID]
    );

    res.status(201).json({
      message: 'Book created successfully.',
      book: createdBook
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /books/:id
 * Updates an existing book
 * Returns 200 OK on success, 404 if ID does not exist
 */
router.put('/:id', validateBookId, validateBookBody, async (req, res, next) => {
  try {
    const db = await getDatabaseConnection();
    const { title, author, price } = req.body;

    // Check if book exists first
    const existingBook = await db.get(
      'SELECT id FROM books WHERE id = ?;',
      [req.bookId]
    );

    if (!existingBook) {
      return res.status(404).json({
        message: `Book with ID ${req.bookId} not found.`
      });
    }

    await db.run(
      'UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?;',
      [title, author, price, req.bookId]
    );

    const updatedBook = await db.get(
      'SELECT id, title, author, price, created_at FROM books WHERE id = ?;',
      [req.bookId]
    );

    res.status(200).json({
      message: 'Book updated successfully.',
      book: updatedBook
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /books/:id
 * Deletes a book by ID
 * Returns 200 OK on success, 404 if ID does not exist
 */
router.delete('/:id', validateBookId, async (req, res, next) => {
  try {
    const db = await getDatabaseConnection();

    // Check if book exists first
    const existingBook = await db.get(
      'SELECT id FROM books WHERE id = ?;',
      [req.bookId]
    );

    if (!existingBook) {
      return res.status(404).json({
        message: `Book with ID ${req.bookId} not found.`
      });
    }

    await db.run('DELETE FROM books WHERE id = ?;', [req.bookId]);

    res.status(200).json({
      message: `Book with ID ${req.bookId} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

