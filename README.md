# StoreRate

> Store rating web application (React, Express, MySQL, JWT)

---

## 📌 Project Overview

**StoreRate** is a full-stack web application for discovering, rating, and managing stores. It has one common login for all roles, role-based access control (RBAC), parameterized MySQL queries, and a responsive React frontend.

---

## 👥 User Roles & Permissions

| Role | Access & Capabilities |
| :--- | :--- |
| **🛡️ System Administrator** | • Complete dashboard metrics: Total Users, Total Stores, Total Ratings<br>• Add and manage users (Admin, Normal User, Store Owner)<br>• Add and register stores (assign to Store Owners)<br>• Search, filter by role, sort, and paginate users and stores<br>• View detailed user profile modals (including owned store rating for store owners) |
| **👤 Normal User** | • Self-registration with strict input validation<br>• Browse all registered stores with card and table views<br>• Real-time store search by **Name** and **Address**<br>• Submit 1–5 star ratings per store (1 rating per store guaranteed)<br>• Modify previously submitted ratings<br>• View personal ratings history under "My Ratings"<br>• Update profile and change account password |
| **🏪 Store Owner** | • View assigned store performance and average rating (stars + numeric score)<br>• View live rating distribution breakdown (5★ to 1★)<br>• View table of all users who submitted ratings for the store with sorting<br>• Change account password |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React Icons, Framer Motion
- **Backend**: Node.js, Express.js (REST API Architecture)
- **Database**: MySQL (Normalized 3NF relational schema, constraints, indexes, cascades)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing (10 salt rounds)
- **Validation**: express-validator (Backend), Real-time regex & character rules (Frontend)

---

## 🔑 Demo Credentials

For quick evaluation during the campus recruitment review, the following pre-seeded accounts are available:

| Role | Email | Password | Assigned Entity |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@storerating.com` | `Admin@123` | Administrator |
| **Store Owner 1** | `owner1@example.com` | `Owner@1234` | Apex Electronics & Gadgets |
| **Store Owner 2** | `owner2@example.com` | `Owner@1234` | Gourmet Artisan Coffee House |
| **Store Owner 3** | `owner3@example.com` | `Owner@1234` | Urban Style Fashion Boutique |
| **Normal User 1** | `user1@example.com` | `User@1234` | Evaluated 3 stores |
| **Normal User 2** | `user2@example.com` | `User@1234` | Evaluated 3 stores |

*(There is one common Login page for every role. After sign-in the user is redirected by role: Admin → `/admin`, User → `/user`, Owner → `/owner`. Store Owners are created by an Admin from Users → + Add User; there is no public owner registration.)*

---

## 📋 Form Validations & Constraints

All validations are enforced on both **client-side** and **server-side**:

1. **Full Name**: Minimum 20 characters, maximum 60 characters.
2. **Address**: Maximum 400 characters.
3. **Password**: 8–16 characters, containing at least one uppercase letter and at least one special character (`!@#$%^&*()_+-=[]{};':"|,.<>/?`).
4. **Email**: Standard email validation format and unique constraint enforcement.
5. **Rating**: Integer between 1 and 5 stars.
6. **Store Ownership**: Exactly one store per Store Owner.
7. **Rating Limit**: Exactly one rating per user per store (modifications update existing ratings).

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or MySQL 8.4)

### 2. Environment Configuration
Create a `.env` file in `backend/`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=storerate

# Or using DATABASE_URL:
DATABASE_URL=mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/storerate
JWT_SECRET=storerate_dev_jwt_secret_change_me
JWT_EXPIRES_IN=7d
```

### 3. Database Migration & Seeding
From the project root:
```bash
npm run db:setup --prefix backend
```

### 4. Run Development Servers
From the project root:
```bash
# Start both backend and frontend concurrently
npm run dev
```

- **Frontend URL**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📡 REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new Normal User
- `POST /api/auth/login` — Single login endpoint (returns JWT & role)
- `POST /api/auth/logout` — Logout user
- `GET /api/auth/me` — Verify session and fetch current user profile

### Stores (`/api/stores`)
- `GET /api/stores` — List stores with search, sort, and pagination
- `GET /api/stores/:id` — Get store details with ratings summary
- `POST /api/stores` — Register a new store (Admin only)
- `PUT /api/stores/:id` — Update store details (Admin only)
- `DELETE /api/stores/:id` — Delete store (Admin only)

### Ratings (`/api/ratings` & `/api/stores/:id/ratings`)
- `POST /api/stores/:id/ratings` — Submit 1–5 star rating (Normal User)
- `PUT /api/stores/:id/ratings/:ratingId` — Modify rating (Normal User)
- `GET /api/ratings/my-ratings` — Get current user's submitted ratings
- `GET /api/stores/:id/ratings` — Get store ratings list (Store Owner/Admin)

### Users (`/api/users`)
- `GET /api/users` — List users with role filter, search, sort (Admin only)
- `GET /api/users/owners` — List eligible store owners (Admin only)
- `POST /api/users` — Create user (Admin only)
- `GET /api/users/:id` — Get user profile details
- `PUT /api/users/:id` — Update user profile
- `PUT /api/users/:id/password` — Change password

### Dashboard Metrics (`/api/dashboard`)
- `GET /api/dashboard/admin` — System Administrator KPI counters & activity feed
- `GET /api/dashboard/store-owner` — Store Owner metrics, average score & customer ratings
- `GET /api/dashboard/user` — Normal User dashboard summary

---

## 📜 License

