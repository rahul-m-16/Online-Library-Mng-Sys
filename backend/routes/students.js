const express = require('express');
const router  = express.Router();
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/',       getStudents);
router.get('/:id',    getStudent);
router.post('/',      authorize('admin', 'librarian'), createStudent);
router.put('/:id',    authorize('admin', 'librarian'), updateStudent);
router.delete('/:id', authorize('admin'),              deleteStudent);

module.exports = router;
