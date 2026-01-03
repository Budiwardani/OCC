# Database Setup - Alternative Method

## ✅ Solution: Use Node.js Script (No psql required)

Since `psql` is not in your system PATH, use this method instead:

```bash
cd backend
npm run init-db
```

This will:
- ✅ Create the OCC database
- ✅ Create all tables
- ✅ Seed initial data
- ✅ Setup admin user with hashed password

## Start the Application

After database initialization completes:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Admin Login
- Email: `admin@occ.com`
- Password: `admin123`

## Note on PostgreSQL Password

The script assumes your postgres user password is `postgres`. 

If your password is different, edit `backend/init-database.js` lines 13 and 30:
```javascript
password: 'YOUR_PASSWORD_HERE'
```

---

## Optional: Add psql to PATH (for future)

If you want to use psql commands later:

1. Find PostgreSQL installation (usually `C:\Program Files\PostgreSQL\XX\bin`)
2. Add to System PATH environment variable
3. Restart terminal
