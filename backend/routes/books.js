const express = require('express');
const router  = express.Router();
const { getBooks, getBook, createBook, updateBook, deleteBook, getByISBN } = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/',            getBooks);
router.get('/isbn/:isbn',  getByISBN);
router.get('/:id',         getBook);
router.post('/',           authorize('admin', 'librarian'), createBook);
router.put('/:id',         authorize('admin', 'librarian'), updateBook);
router.delete('/:id',      authorize('admin'),              deleteBook);

module.exports = router;
