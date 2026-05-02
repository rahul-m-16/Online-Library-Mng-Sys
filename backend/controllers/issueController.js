const Issue   = require('../models/Issue');
const Book    = require('../models/Book');
const Student = require('../models/Student');

const FINE_PER_DAY = Number(process.env.FINE_PER_DAY) || 5;
const DEFAULT_LOAN = 14; // days

// Helper: calculate fine
const calcFine = (dueDate) => {
  const now  = new Date();
  const due  = new Date(dueDate);
  const days = Math.floor((now - due) / 86400000);
  return days > 0 ? days * FINE_PER_DAY : 0;
};

// Helper: mark overdue records
const syncOverdue = async () => {
  await Issue.updateMany(
    { status: 'issued', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );
};

// @desc  Get all issues with filters
// @route GET /api/issues
exports.getIssues = async (req, res, next) => {
  try {
    await syncOverdue();
    const { status, page = 1, limit = 10, search } = req.query;
    const query = {};
    if (status) query.status = status;

    let pipeline = [
      {
        $lookup: { from: 'books',    localField: 'book',    foreignField: '_id', as: 'book' },
      },
      { $unwind: '$book' },
      {
        $lookup: { from: 'students', localField: 'student', foreignField: '_id', as: 'student' },
      },
      { $unwind: '$student' },
    ];

    if (status) pipeline.push({ $match: { status } });
    if (search) {
      const s = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'book.title': s },
            { 'student.name': s },
            { 'student.regNo': s },
          ],
        },
      });
    }

    // Count total
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult   = await Issue.aggregate(countPipeline);
    const total         = countResult[0]?.total || 0;

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) }
    );

    const issues = await Issue.aggregate(pipeline);

    res.json({
      success: true,
      data: issues,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Issue a book
// @route POST /api/issues
exports.issueBook = async (req, res, next) => {
  try {
    const { bookId, studentId, loanDays = DEFAULT_LOAN } = req.body;

    // Validate student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (student.status === 'suspended') {
      return res.status(400).json({ success: false, message: 'Student account is suspended' });
    }

    // Validate book
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.available <= 0) {
      return res.status(400).json({ success: false, message: 'No copies available' });
    }

    // Check duplicate active issue
    const existing = await Issue.findOne({ book: bookId, student: studentId, status: { $in: ['issued', 'overdue'] } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Student already has this book issued' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(loanDays));

    const issue = await Issue.create({
      book: bookId,
      student: studentId,
      dueDate,
      issuedBy: req.user._id,
    });

    // Decrement available
    await Book.findByIdAndUpdate(bookId, { $inc: { available: -1 } });

    const populated = await Issue.findById(issue._id)
      .populate('book',    'title author isbn coverColor')
      .populate('student', 'name regNo department');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc  Return a book
// @route PUT /api/issues/:id/return
exports.returnBook = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue record not found' });
    if (issue.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Book already returned' });
    }

    const fine = calcFine(issue.dueDate);

    issue.status       = 'returned';
    issue.returnDate   = new Date();
    issue.fine         = fine;
    issue.returnedBy   = req.user._id;
    await issue.save();

    // Increment available
    await Book.findByIdAndUpdate(issue.book, { $inc: { available: 1 } });

    const populated = await Issue.findById(issue._id)
      .populate('book',    'title author isbn coverColor')
      .populate('student', 'name regNo department');

    res.json({ success: true, data: populated, fine });
  } catch (err) {
    next(err);
  }
};

// @desc  Get dashboard stats
// @route GET /api/issues/stats
exports.getStats = async (req, res, next) => {
  try {
    await syncOverdue();

    const [books, students, issueStats] = await Promise.all([
      Book.aggregate([
        { $group: { _id: null, totalBooks: { $sum: '$quantity' }, availableBooks: { $sum: '$available' } } },
      ]),
      Student.countDocuments(),
      Issue.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalFine: { $sum: '$fine' },
          },
        },
      ]),
    ]);

    const bookData    = books[0] || { totalBooks: 0, availableBooks: 0 };
    const statsMap    = issueStats.reduce((acc, s) => { acc[s._id] = s; return acc; }, {});

    const issuedCount  = (statsMap.issued?.count  || 0) + (statsMap.overdue?.count || 0);
    const overdueCount = statsMap.overdue?.count  || 0;
    const returnedCount= statsMap.returned?.count || 0;
    const totalFines   = Object.values(statsMap).reduce((s, x) => s + (x.totalFine || 0), 0);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const monthlyTrend = await Issue.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Category distribution
    const categoryDist = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalBooks:     bookData.totalBooks,
        availableBooks: bookData.availableBooks,
        issuedBooks:    issuedCount,
        totalStudents:  students,
        overdueBooks:   overdueCount,
        returnedBooks:  returnedCount,
        totalFines,
        monthlyTrend,
        categoryDist,
      },
    });
  } catch (err) {
    next(err);
  }
};
