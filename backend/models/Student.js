const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    regNo:      { type: String, required: true, unique: true, trim: true, uppercase: true },
    department: {
      type: String,
      required: true,
      enum: [
        'Computer Science & Engineering',
        'Electronics & Communication',
        'Mechanical Engineering',
        'Civil Engineering',
        'Information Technology',
        'Electrical Engineering',
        'Mathematics',
        'Physics',
      ],
    },
    email:  { type: String, required: true, unique: true, lowercase: true },
    phone:  { type: String, required: true, match: /^[6-9]\d{9}$/ },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: initials
studentSchema.virtual('initials').get(function () {
  return this.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

// Text index
studentSchema.index({ name: 'text', regNo: 'text', email: 'text' });

module.exports = mongoose.model('Student', studentSchema);
