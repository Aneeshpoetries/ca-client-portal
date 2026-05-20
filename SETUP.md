# CA LMS Portal — Setup Guide

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

---

## Backend Setup

```bash
cd backend
npm install
```

Edit `.env` with your MongoDB URI and secrets:
```
MONGODB_URI=mongodb://localhost:27017/ca_lms_portal
JWT_SECRET=change_this_to_a_long_random_string
CA_REGISTRATION_CODE=CA_ADMIN_SECRET_2024
```

Start the server:
```bash
npm run dev      # development (nodemon)
npm start        # production
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## First Time Use

1. Go to `/register`
2. Fill name, email, password
3. Enter the **CA Registration Code** (`CA_ADMIN_SECRET_2024` by default) to register as CA
4. Omit the code to register as Staff

---

## Roles

| Feature | CA | Staff |
|---|---|---|
| View all clients | ✅ | Only assigned |
| Add clients | ✅ | ❌ |
| Upload client docs | ❌ | ✅ |
| Upload GST returns / ITR | ✅ | ❌ |
| Create staff accounts | ✅ | ❌ |
| Assign staff to clients | ✅ | ❌ |
| Delete any document | ✅ | Own only |

---

## Document Categories

**Uploaded by Staff:**
- Bank statements, invoices, purchase bills, ledgers, etc.

**Uploaded by CA:**
- GSTR-1, GSTR-3B, GSTR-9, GSTR-9C (GST Returns)
- ITR-1 through ITR-6, Form 16, Form 26AS (Income Tax)
- Tax Audit reports

Documents are organized by Financial Year (last 10 years).
