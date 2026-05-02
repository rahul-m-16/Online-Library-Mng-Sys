const Book = require('../models/Book');

// @desc  Get all books with search, filter, pagination
// @route GET /api/books
exports.getBooks = async (req, res, next) => {
  try {
    const { search, category, availability, sort = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (availability === 'available') query.available = { $gt: 0 };
    if (availability === 'out') query.available = 0;

    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [books, total] = await Promise.all([
      Book.find(query).sort(sortObj).skip(skip).limit(Number(limit)),
      Book.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: books,
      pagination: {
        total,
        page:  Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single book
// @route GET /api/books/:id
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// @desc  Create book
// @route POST /api/books
exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create({ ...req.body, available: req.body.quantity });
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// @desc  Update book
// @route PUT /api/books/:id
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete book
// @route DELETE /api/books/:id
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    res.json({ success: true, message: 'Book deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc  Lookup book by ISBN (for barcode scanner)
// @route GET /api/books/isbn/:isbn
exports.getByISBN = async (req, res, next) => {
  try {
    const book = await Book.findOne({ isbn: req.params.isbn });
    if (!book) return res.status(404).json({ success: false, message: 'No book found with this ISBN' });
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};
