// Request validation middleware for /books API

function validateBookBody(req, res, next) {
  const { title, author, price } = req.body;

  if (title === undefined || title === null || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      message: 'Validation error: "title" is required and must be a non-empty string.'
    });
  }

  if (author === undefined || author === null || typeof author !== 'string' || author.trim() === '') {
    return res.status(400).json({
      message: 'Validation error: "author" is required and must be a non-empty string.'
    });
  }

  if (price === undefined || price === null || price === '') {
    return res.status(400).json({
      message: 'Validation error: "price" is required.'
    });
  }

  const numericPrice = Number(price);
  if (isNaN(numericPrice) || !isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      message: 'Validation error: "price" must be a valid non-negative number.'
    });
  }

  // Normalize trimmed values and numeric price on request body
  req.body.title = title.trim();
  req.body.author = author.trim();
  req.body.price = numericPrice;

  next();
}

function validateQueryParams(req, res, next) {
  const {
    search_q = '',
    order_by = 'id',
    order = 'ASC',
    limit = '10',
    offset = '0',
    min_price,
    max_price
  } = req.query;

  // Allowed columns whitelist for sorting
  const allowedSortColumns = ['id', 'title', 'author', 'price', 'created_at'];
  const normalizedOrderBy = String(order_by).toLowerCase();

  if (!allowedSortColumns.includes(normalizedOrderBy)) {
    return res.status(400).json({
      message: `Invalid order_by parameter. Allowed columns: ${allowedSortColumns.join(', ')}`
    });
  }

  // Allowed order directions
  const normalizedOrder = String(order).toUpperCase();
  if (!['ASC', 'DESC'].includes(normalizedOrder)) {
    return res.status(400).json({
      message: 'Invalid order parameter. Allowed values: ASC, DESC'
    });
  }

  // Validate limit & offset
  const parsedLimit = Number(limit);
  if (isNaN(parsedLimit) || !Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    return res.status(400).json({
      message: 'Invalid limit parameter. Limit must be a positive integer.'
    });
  }

  const parsedOffset = Number(offset);
  if (isNaN(parsedOffset) || !Number.isInteger(parsedOffset) || parsedOffset < 0) {
    return res.status(400).json({
      message: 'Invalid offset parameter. Offset must be a non-negative integer.'
    });
  }

  let parsedMinPrice = null;
  if (min_price !== undefined) {
    parsedMinPrice = Number(min_price);
    if (isNaN(parsedMinPrice) || parsedMinPrice < 0) {
      return res.status(400).json({
        message: 'Invalid min_price parameter. Must be a non-negative number.'
      });
    }
  }

  let parsedMaxPrice = null;
  if (max_price !== undefined) {
    parsedMaxPrice = Number(max_price);
    if (isNaN(parsedMaxPrice) || parsedMaxPrice < 0) {
      return res.status(400).json({
        message: 'Invalid max_price parameter. Must be a non-negative number.'
      });
    }
  }

  if (parsedMinPrice !== null && parsedMaxPrice !== null && parsedMinPrice > parsedMaxPrice) {
    return res.status(400).json({
      message: 'Invalid price range: min_price cannot be greater than max_price.'
    });
  }

  // Attach sanitized and validated query parameters
  req.validatedQuery = {
    search_q: String(search_q).trim(),
    order_by: normalizedOrderBy,
    order: normalizedOrder,
    limit: parsedLimit,
    offset: parsedOffset,
    min_price: parsedMinPrice,
    max_price: parsedMaxPrice
  };

  next();
}

function validateBookId(req, res, next) {
  const { id } = req.params;
  const parsedId = Number(id);

  if (isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      message: 'Invalid book ID. ID must be a positive integer.'
    });
  }

  req.bookId = parsedId;
  next();
}

module.exports = {
  validateBookBody,
  validateQueryParams,
  validateBookId
};

