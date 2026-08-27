# OCC System - Online Customer Complaint

Production-grade complaint management system with public submission, tracking, and admin dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)

### Database Setup

1. **Create Database:**
```bash
psql -U postgres -c "CREATE DATABASE occ;"
```

2. **Run Schema:**
```bash
psql -U postgres -d occ -f backend/schema.sql
```

3. **Setup Admin User (Hash Password):**
```bash
cd backend
node setup-db.js
```

**Default Admin Credentials:**
- Email: `admin@occ.com`
- Password: `superadmin123`

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 📁 Project Structure

```
OCC/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── config/      # Database & environment config
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/  # Auth & validation
│   │   ├── routes/      # API routes
│   │   ├── services/    # External services
│   │   └── utils/       # Utilities
│   ├── schema.sql       # Database schema
│   └── setup-db.js      # Database setup script
└── frontend/            # React + Vite SPA
    └── src/
        ├── api/         # API client
        ├── components/  # Reusable components
        └── pages/       # Page components
```

## 🔑 Key Features

### Public Features (No Login Required)
- ✅ Submit complaints anonymously
- ✅ Track complaint status via ticket code + token
- ✅ View response history

### Admin Features
- ✅ Dashboard with KPI metrics
- ✅ View all complaints
- 🔄 Manage complaint status (Coming soon)
- 🔄 Assign agents (Coming soon)
- 🔄 Reply to customers (Coming soon)

## 🗄️ Database Schema

**Main Tables:**
- `companies` - Multi-tenant support
- `users` - Admin, agents, supervisors
- `complaints` - Customer complaints
- `complaint_responses` - Communication log
- `complaint_attachments` - File uploads
- `complaint_sla` - SLA tracking
- `audit_logs` - Audit trail

## 🔐 Security Features

- JWT-based authentication
- Token-based public tracking
- Password hashing (bcrypt)
- SQL injection protection
- CORS enabled
- Helmet security headers

## 📊 API Endpoints

### Public APIs
- `POST /api/public/complaints` - Submit complaint
- `GET /api/public/tracking` - Track complaint

### Admin APIs (Requires JWT)
- `GET /api/dashboard/stats` - Dashboard metrics

## 🎨 Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- bcryptjs

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- Axios

## 🔧 Environment Variables

### Backend `.env`
```
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/occ
JWT_SECRET=super_secret_occ_key_123
NODE_ENV=development
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

## 📝 Development Notes

- Admin authentication is simplified for MVP (mock token in Dashboard.jsx)
- Full auth flow (login/register) will be implemented in next iteration
- File uploads pending implementation
- Email notifications pending implementation

## 🚧 Roadmap

- [ ] Complete admin authentication flow
- [ ] Complaint list view & filtering
- [ ] Agent assignment
- [ ] Customer response system
- [ ] File upload support
- [ ] Email notifications
- [ ] SLA tracking & alerts
- [ ] Role-based access control
- [ ] Reporting & analytics

## 📄 License

Proprietary - OCC System

---

**Created:** January 2026  
**Version:** 1.0.0 MVP
