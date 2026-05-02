const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    book:       { type: mongoose.Schema.Types.ObjectId, ref: 'Book',    required: true },
    student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    issueDate:  { type: Date, default: Date.now },
    dueDate:    { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status:     { type: String, enum: ['issued', 'returned', 'overdue'], default: 'issued' },
    fine:       { type: Number, default: 0, min: 0 },
    finePaid:   { type: Boolean, default: false },
    issuedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    returnedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes:      { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-update status to overdue on query
issueSchema.pre(/^find/, function (next) {
  // We'll handle overdue detection in the controller
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
