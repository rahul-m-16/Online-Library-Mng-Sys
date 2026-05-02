const Student = require('../models/Student');
const Issue   = require('../models/Issue');

// @desc  Get all students
// @route GET /api/students
exports.getStudents = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) query.$text = { $search: search };
    if (department) query.department = department;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [students, total] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Student.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: students,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single student with their issues
// @route GET /api/students/:id
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const issues = await Issue.find({ student: student._id })
      .populate('book', 'title author isbn coverColor')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { ...student.toJSON(), issues } });
  } catch (err) {
    next(err);
  }
};

// @desc  Create student
// @route POST /api/students
exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc  Update student
// @route PUT /api/students/:id
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete student
// @route DELETE /api/students/:id
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student removed' });
  } catch (err) {
    next(err);
  }
};
