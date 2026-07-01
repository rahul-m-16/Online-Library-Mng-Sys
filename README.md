# 📚 Online Library Management System — MERN Stack Library Management System

A full-stack web application developed using **MongoDB**, **Express.js**, **React.js**, and **Node.js** to efficiently manage library operations including book management, student records, book issue/return, and administrative activities through a modern and responsive dashboard.

---

## ✨ Features

### 🔐 Authentication
- Secure user authentication
- JWT-based authorization
- Password encryption using bcryptjs
- Protected routes
- Persistent user sessions

### 📊 Dashboard
- Library overview with key statistics
- Total Books
- Available Books
- Issued Books
- Registered Students
- Recent Activities
- Quick Navigation Cards

### 📚 Book Management
- Add new books
- Update book details
- Delete books
- Search books by title, author, or ISBN
- Filter books by category
- Book availability tracking

### 👨‍🎓 Student Management
- Register new students
- Update student information
- Delete student records
- Search students
- Student borrowing history
- Active issue tracking

### 🔄 Book Issue & Return
- Issue books to students
- Return issued books
- Due date tracking
- Issue history
- Book availability updates
- Borrow status management

### 📈 Reports & Analytics
- Total issued books
- Available books analysis
- Student borrowing statistics
- Monthly issue reports
- Book category distribution
- CSV Export

### ⚙️ Settings
- User Profile Management
- Account Settings
- Theme Preferences
- System Configuration

---

## 🗂 Project Structure

```text
Online-Library-Management-System/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Student.js
│   │   ├── Issue.js
│   │   └── Category.js
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── layouts/
    │   ├── pages/
    │   │   ├── Login/
    │   │   ├── Dashboard/
    │   │   ├── Books/
    │   │   ├── Students/
    │   │   ├── IssueReturn/
    │   │   ├── Reports/
    │   │   └── Settings/
    │   ├── services/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🔄 Application Workflow

```text
User Login
      │
      ▼
Authentication (JWT)
      │
      ▼
Dashboard
      │
 ┌────┼───────────┬─────────────┐
 ▼    ▼           ▼             ▼
Books Students Issue/Return Reports
      │
      ▼
Library Database
      │
      ▼
Dashboard Analytics
      │
      ▼
Library Reports
```

---

## 🌐 Core Modules

### Authentication
- User Login
- JWT Authentication
- Protected Routes
- Password Encryption

### Dashboard
- Library Statistics
- Recent Activities
- Quick Summary Cards

### Book Management
- Add Books
- Edit Books
- Delete Books
- Search & Filter
- Availability Tracking

### Student Management
- Student Registration
- Student Details
- Borrowing History
- Active Issues

### Issue & Return
- Book Issue
- Book Return
- Due Date Tracking
- Borrow Records

### Reports
- Library Summary
- Book Reports
- Student Reports
- CSV Export

---

## 🛠 Tech Stack

| Layer | Technology |
|---------|------------|
| Database | MongoDB + Mongoose |
| Backend | Node.js + Express.js |
| Authentication | JWT + bcryptjs |
| Frontend | React.js + Vite |
| State Management | Context API |
| Styling | Tailwind CSS |
| Charts | Chart.js |
| HTTP Client | Axios |
| Deployment | Vercel + Render |

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing using bcryptjs
- Protected API Routes
- Secure User Sessions
- Environment Variable Configuration
- Role-Based Access Control (Admin/User)

---

## 📊 Database Collections

- Users
- Books
- Students
- Issues
- Categories

---

## 📈 Future Enhancements

- Barcode Scanner Integration
- QR Code-Based Book Issue
- Email Notifications
- Online Book Reservation
- Fine Management System
- AI Book Recommendation
- Mobile Application
- Digital Library Support

---

## 🌐 Project Highlights

- Full Stack MERN Application
- Responsive User Interface
- Library Inventory Management
- Student Management System
- Book Issue & Return Tracking
- Interactive Dashboard
- Secure Authentication
- RESTful API Architecture
- Cloud-Ready Architecture

---

## 👨‍💻 Author

**Rahul Sanjeev Madagoud**

Master of Computer Applications (MCA)

Jain College of Engineering, Belagavi

Email: **rahulmadagoud@gmail.com**
