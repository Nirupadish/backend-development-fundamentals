const express = require('express');
const cors = require('cors');
const booksRouter = require('./routes/books');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

// API health check / overview route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to BDF Lab 3 REST API (Books Catalog)',
    endpoints: {
      getAllBooks: 'GET /books',
      getBookById: 'GET /books/:id',
      createBook: 'POST /books',
      updateBook: 'PUT /books/:id',
      deleteBook: 'DELETE /books/:id'
    },
    supportedQueryParameters: [
      'search_q',
      'order_by (id, title, author, price, created_at)',
      'order (ASC, DESC)',
      'limit',
      'offset',
      'min_price',
      'max_price'
    ]
  });
});

// RESTful resource routes
app.use('/books', booksRouter);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;

