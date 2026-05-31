# ⚡ TaskFlow — MERN Task Management App

A full-stack task management web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Features JWT authentication, a drag-and-drop Kanban board, rich filtering, and dark mode.

---

## 🖼 Features

### Core
- **Authentication** — JWT-based register/login/logout with protected routes
- **Dashboard** — Stats overview, completion progress bar, and full drag-and-drop Kanban board
- **Task CRUD** — Create, read, update, and delete tasks with full validation
- **Task List View** — Searchable, filterable, sortable task list
- **Responsive** — Mobile-first design with collapsible sidebar

### Bonus
- 🔍 **Search & Filter** — Real-time search + filter by status, priority, and sort order
- 🗂 **Drag-and-Drop** — Move tasks between Kanban columns with `@hello-pangea/dnd`
- 🌙 **Dark Mode** — Full dark/light theme toggle, persisted to localStorage
- 🏷 **Tags** — Add multiple tags to tasks for categorization

### Task Fields
| Field | Type | Values |
|-------|------|--------|
| Title | String | 3–100 chars |
| Description | String | up to 1000 chars |
| Status | Enum | `todo`, `in-progress`, `review`, `done` |
| Priority | Enum | `low`, `medium`, `high`, `urgent` |
| Due Date | Date | optional |
| Tags | String[] | up to 8 tags |
| Created By | ObjectId | ref: User |

---

## 🗂 Project Structure

```
taskflow/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js            # JWT protect middleware
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema (bcrypt hashed pw)
│   │   └── Task.js            # Task schema with indexes
│   ├── routes/
│   │   ├── auth.js            # /api/auth/* endpoints
│   │   └── tasks.js           # /api/tasks/* endpoints
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── ConfirmModal.js
    │   │   ├── Layout.js      # Sidebar + topbar shell
    │   │   ├── Spinner.js
    │   │   ├── TaskBadges.js  # StatusBadge, PriorityBadge, DueDate
    │   │   └── TaskForm.js    # Shared create/edit form
    │   ├── context/
    │   │   ├── AuthContext.js # Auth state + login/register/logout
    │   │   └── TaskContext.js # Task CRUD + optimistic updates
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   ├── Dashboard.js   # Kanban + stats
    │   │   ├── TaskList.js    # List view + search/filter
    │   │   ├── CreateTask.js
    │   │   └── EditTask.js
    │   ├── utils/
    │   │   └── api.js         # Axios instance + API helpers
    │   ├── App.js             # Router + providers
    │   └── index.css          # Design system + global styles
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v16+
- **MongoDB** (local) or a [MongoDB Atlas](https://cloud.mongodb.com) cluster
- **npm** or **yarn**

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

---

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend:

```bash
npm run dev      # with nodemon (hot reload)
# or
npm start        # production
```

The API will be available at `http://localhost:5000`.

---

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` if your backend runs on a different port:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

The app will open at `http://localhost:3000`.

---

### 4. Run both together (from root)

```bash
# From the project root
npm install          # installs concurrently
npm run dev          # starts backend + frontend simultaneously
```

---

## 🌐 API Reference

### Auth Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login and receive JWT | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update name/avatar | Yes |

### Task Endpoints (`/api/tasks`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all tasks (search/filter/sort) | Yes |
| POST | `/` | Create a task | Yes |
| GET | `/:id` | Get a single task | Yes |
| PUT | `/:id` | Update a task | Yes |
| DELETE | `/:id` | Delete a task | Yes |
| PUT | `/:id/status` | Update status only | Yes |
| DELETE | `/` | Clear all completed tasks | Yes |

#### GET /api/tasks — Query Parameters

| Param | Values | Default |
|-------|--------|---------|
| `search` | string | — |
| `status` | `todo` / `in-progress` / `review` / `done` | all |
| `priority` | `low` / `medium` / `high` / `urgent` | all |
| `sortBy` | `createdAt` / `dueDate` / `priority` | `createdAt` |
| `sortOrder` | `asc` / `desc` | `desc` |
| `page` | number | `1` |
| `limit` | number | `50` |

---

## ☁️ Deployment

### Backend — Render

1. Push backend to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set environment variables (MONGODB_URI, JWT_SECRET, etc.)
4. Build command: `npm install` · Start command: `node server.js`

### Frontend — Vercel

1. Push frontend to GitHub
2. Import on [Vercel](https://vercel.com), set root to `frontend/`
3. Add `REACT_APP_API_URL=https://your-backend.onrender.com/api`
4. Deploy

---

## 🧠 Approach Summary

**Architecture**: Standard MERN stack with a clear separation between API and UI. The backend is a stateless REST API; all authentication state lives in JWTs stored in localStorage.

**State Management**: React Context API with two contexts — `AuthContext` for user session and `TaskContext` for task data. The task context uses optimistic updates for status changes (drag-and-drop feels instant even on slow connections).

**Security**: Passwords are hashed with bcrypt (12 salt rounds). JWT tokens are verified on every protected route. Input is validated server-side with `express-validator` and client-side before API calls.

**UI/UX**: Custom design system via CSS variables with full dark mode support. Drag-and-drop via `@hello-pangea/dnd`. Toast notifications via `react-hot-toast`. Responsive sidebar collapses on mobile.

**Database**: MongoDB with Mongoose. Tasks are indexed on `createdBy + status` and `createdBy + dueDate` for efficient filtering. The `User.matchPassword` instance method keeps auth logic co-located with the model.

---

## 📄 License

MIT
