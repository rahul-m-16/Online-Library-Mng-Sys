const express = require('express');
const router  = express.Router();
const { getIssues, issueBook, returnBook, getStats } = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.get('/',      getIssues);
router.post('/',     authorize('admin', 'librarian'), issueBook);
router.put('/:id/return', authorize('admin', 'librarian'), returnBook);

module.exports = router;
