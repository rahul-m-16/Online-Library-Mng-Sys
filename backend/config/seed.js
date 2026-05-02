require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');

// Import models
const User = require('../models/User');
const Book = require('../models/Book');
const Student = require('../models/Student');
const Issue = require('../models/Issue');

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Book.deleteMany(),
    Student.deleteMany(),
    Issue.deleteMany(),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Users ────────────────────────────────────────────────
  const users = await User.insertMany([
    {
      name: 'Admin User',
      username: 'admin',
      email: 'admin@library.edu',
      password: await bcrypt.hash('Admin@1234', 10),
      role: 'admin',
    },
    {
      name: 'Jane Librarian',
      username: 'librarian',
      email: 'librarian@library.edu',
      password: await bcrypt.hash('Lib@12345', 10),
      role: 'librarian',
    },
  ]);
  console.log(`👤 Seeded ${users.length} users`);

  // ── Books ────────────────────────────────────────────────
  const books = await Book.insertMany([
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', category: 'Computer Science', quantity: 5, available: 3, rack: 'A-01', coverColor: '#6366f1', year: 2008 },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', isbn: '9780201616224', category: 'Computer Science', quantity: 4, available: 2, rack: 'A-02', coverColor: '#0ea5e9', year: 1999 },
    { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '9780262033848', category: 'Computer Science', quantity: 6, available: 6, rack: 'A-03', coverColor: '#10b981', year: 2009 },
    { title: 'Design Patterns', author: 'Gang of Four', isbn: '9780201633610', category: 'Computer Science', quantity: 3, available: 1, rack: 'A-04', coverColor: '#f59e0b', year: 1994 },
    { title: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '9781285741550', category: 'Mathematics', quantity: 8, available: 5, rack: 'B-01', coverColor: '#ec4899', year: 2015 },
    { title: 'Linear Algebra Done Right', author: 'Sheldon Axler', isbn: '9783319110790', category: 'Mathematics', quantity: 4, available: 4, rack: 'B-02', coverColor: '#8b5cf6', year: 2015 },
    { title: 'University Physics', author: 'Hugh Young', isbn: '9780321696861', category: 'Physics', quantity: 7, available: 3, rack: 'C-01', coverColor: '#06b6d4', year: 2019 },
    { title: 'Organic Chemistry', author: 'Paula Bruice', isbn: '9780134042282', category: 'Chemistry', quantity: 5, available: 5, rack: 'D-01', coverColor: '#f97316', year: 2016 },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', category: 'Literature', quantity: 10, available: 8, rack: 'E-01', coverColor: '#84cc16', year: 1925 },
    { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', category: 'History', quantity: 6, available: 2, rack: 'F-01', coverColor: '#ef4444', year: 2015 },
    { title: 'Python Crash Course', author: 'Eric Matthes', isbn: '9781593279288', category: 'Computer Science', quantity: 8, available: 4, rack: 'A-05', coverColor: '#3b82f6', year: 2019 },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', category: 'Psychology', quantity: 4, available: 0, rack: 'G-01', coverColor: '#a855f7', year: 2011 },
  ]);
  console.log(`📚 Seeded ${books.length} books`);

  // ── Students ─────────────────────────────────────────────
  const students = await Student.insertMany([
    { name: 'Arjun Sharma', regNo: 'CS2021001', department: 'Computer Science & Engineering', email: 'arjun@college.edu', phone: '9876543210', status: 'active' },
    { name: 'Priya Nair', regNo: 'CS2021002', department: 'Computer Science & Engineering', email: 'priya@college.edu', phone: '9876543211', status: 'active' },
    { name: 'Rahul Verma', regNo: 'EC2021001', department: 'Electronics & Communication', email: 'rahul@college.edu', phone: '9876543212', status: 'active' },
    { name: 'Sneha Reddy', regNo: 'ME2022001', department: 'Mechanical Engineering', email: 'sneha@college.edu', phone: '9876543213', status: 'active' },
    { name: 'Kiran Kumar', regNo: 'IT2022001', department: 'Information Technology', email: 'kiran@college.edu', phone: '9876543214', status: 'active' },
    { name: 'Divya Menon', regNo: 'CS2022001', department: 'Computer Science & Engineering', email: 'divya@college.edu', phone: '9876543215', status: 'suspended' },
    { name: 'Aditya Singh', regNo: 'EE2023001', department: 'Electrical Engineering', email: 'aditya@college.edu', phone: '9876543216', status: 'active' },
    { name: 'Meera Pillai', regNo: 'MA2023001', department: 'Mathematics', email: 'meera@college.edu', phone: '9876543217', status: 'active' },
  ]);
  console.log(`🎓 Seeded ${students.length} students`);

  // ── Issues ────────────────────────────────────────────────
  const now = new Date();
  const daysAgo = (n) => new Date(now - n * 86400000);
  const daysLater = (n) => new Date(now.getTime() + n * 86400000);

  await Issue.insertMany([
    { book: books[0]._id, student: students[0]._id, issueDate: daysAgo(10), dueDate: daysLater(4), status: 'issued', fine: 0 },
    { book: books[1]._id, student: students[1]._id, issueDate: daysAgo(20), dueDate: daysAgo(6), returnDate: daysAgo(7), status: 'returned', fine: 0 },
    { book: books[3]._id, student: students[2]._id, issueDate: daysAgo(30), dueDate: daysAgo(16), status: 'overdue', fine: 80 },
    { book: books[6]._id, student: students[3]._id, issueDate: daysAgo(8), dueDate: daysLater(6), status: 'issued', fine: 0 },
    { book: books[9]._id, student: students[4]._id, issueDate: daysAgo(15), dueDate: daysAgo(1), status: 'overdue', fine: 5 },
    { book: books[11]._id, student: students[0]._id, issueDate: daysAgo(5), dueDate: daysLater(9), status: 'issued', fine: 0 },
    { book: books[2]._id, student: students[6]._id, issueDate: daysAgo(18), dueDate: daysAgo(4), returnDate: daysAgo(5), status: 'returned', fine: 0 },
    { book: books[4]._id, student: students[7]._id, issueDate: daysAgo(6), dueDate: daysLater(8), status: 'issued', fine: 0 },
  ]);
  console.log(`🔄 Seeded issue records`);

  console.log('\n✅ Database seeded successfully!');
  console.log('─────────────────────────────────');
  console.log('Login credentials:');
  console.log('  Admin     → admin / Admin@1234');
  console.log('  Librarian → librarian / Lib@12345');
  console.log('─────────────────────────────────\n');

  mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
