# 📖 LibraryOS — MERN Stack Library Management System

A full-stack, production-ready Library Management System built with **MongoDB**, **Express**, **React** (Vite), and **Node.js**.

---

## ✨ Features

### 🔐 Authentication
- JWT-based login with role support (Admin / Librarian)
- Password strength validation (uppercase, number, special char)
- Show/hide password toggle
- Forgot password UI (mock)
- Protected routes with token persistence

### 📊 Dashboard
- Live statistics: Total Books, Issued, Available, Students
- Issue trend line chart (Chart.js)
- Category distribution doughnut chart
- Overdue alerts and quick actions

### 📚 Book Management
- Add / Edit / Delete books with full validation
- Search by title, author, ISBN
- Filter by category and availability
- Pagination and sorting
- ISBN barcode scan simulation (autofill)
- Book detail page with issue history

### 🎓 Student Management
- Add / Edit / Delete students
- Search by name, register number, email
- Filter by department and status
- Student profile with active borrows and fine history

### 🔄 Issue & Return
- 3-step Issue Book wizard (student → book → confirm)
- Configurable loan period (7/14/21/30 days)
- Return Book with automatic fine calculation (₹5/day overdue)
- Status tracking: issued / overdue / returned

### 📷 Barcode Scanner
- Live camera integration (real device)
- Animated scan line UI
- Manual ISBN entry fallback
- Demo scan with random ISBN
- Scan history panel

### 📊 Reports & Analytics
- Return rate, total fines, overdue count
- Category bar chart
- Monthly issue trend
- Full issues export to CSV

### ⚙️ Settings
- Dark / Light mode toggle (persisted)
- Library policy config (fine rate, loan days, max books)
- Notification toggles
- Change password
- System info

---

## 🗂 Project Structure

```
lms-mern/
├── backend/
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   └── seed.js         # Database seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── studentController.js
│   │   └── issueController.js
│   ├── middleware/
│   │   ├── auth.js         # JWT protect + role authorize
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Student.js
│   │   └── Issue.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── students.js
│   │   └── issues.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js        # Axios instance with JWT interceptors
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── index.jsx   # Reusable UI components
    │   │   └── layout/
    │   │       ├── AppLayout.jsx
    │   │       ├── Sidebar.jsx
    │   │       ├── Topbar.jsx
    │   │       └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── index.js        # useFetch, useForm, useModal, etc.
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Books/
    │   │   ├── Students/
    │   │   ├── Issues/
    │   │   ├── Scanner/
    │   │   ├── Reports/
    │   │   └── Settings/
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI
- **npm** v9 or higher

---

### 1. Clone / Extract the project

```bash
cd lms-mern
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment

Edit `backend/.env` and update `MONGO_URI` if needed:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/library_management
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
FINE_PER_DAY=5
```

### 4. Seed the database

```bash
cd backend && npm run seed
```

This creates:
- 2 users (admin + librarian)
- 12 books
- 8 students
- 8 issue records

### 5. Run the application

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
# Runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Login Credentials

| Role       | Username    | Password    |
|------------|-------------|-------------|
| Admin      | `admin`     | `Admin@1234`|
| Librarian  | `librarian` | `Lib@12345` |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | `/api/auth/login`           | Login                |
| GET    | `/api/auth/me`              | Get current user     |
| PUT    | `/api/auth/change-password` | Change password      |

### Books
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | `/api/books`              | List (search/filter) |
| GET    | `/api/books/:id`          | Get single book      |
| GET    | `/api/books/isbn/:isbn`   | Lookup by ISBN       |
| POST   | `/api/books`              | Create book          |
| PUT    | `/api/books/:id`          | Update book          |
| DELETE | `/api/books/:id`          | Delete book          |

### Students
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | `/api/students`      | List (search/filter) |
| GET    | `/api/students/:id`  | Get with issues      |
| POST   | `/api/students`      | Create student       |
| PUT    | `/api/students/:id`  | Update student       |
| DELETE | `/api/students/:id`  | Delete student       |

### Issues
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | `/api/issues`             | List all issues      |
| GET    | `/api/issues/stats`       | Dashboard stats      |
| POST   | `/api/issues`             | Issue a book         |
| PUT    | `/api/issues/:id/return`  | Return a book        |

---

## 🛠 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Database  | MongoDB + Mongoose                  |
| Backend   | Node.js + Express.js                |
| Auth      | JWT + bcryptjs                      |
| Frontend  | React 18 + Vite                     |
| Routing   | React Router v6                     |
| Styling   | Tailwind CSS v3 (dark mode)         |
| Charts    | Chart.js + react-chartjs-2          |
| HTTP      | Axios (with JWT interceptors)       |
| Toasts    | react-hot-toast                     |
| Icons     | Lucide React                        |

---

## 📝 Notes

- The Vite dev server proxies all `/api` requests to `http://localhost:5000`
- Dark mode preference is saved to `localStorage`
- JWT token is stored in `localStorage` and attached via Axios interceptor
- Fine calculation: ₹5 per overdue day (configurable in `.env` via `FINE_PER_DAY`)
- Barcode scanner uses the browser's `getUserMedia` API (requires HTTPS or localhost)

---

## 📄 License

MIT © 2024 LibraryOS
