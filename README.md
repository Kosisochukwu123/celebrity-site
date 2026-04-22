# Celebrity Site — React + Node.js

## Stack
- **Frontend**: React 18, Vite, React Router v6
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Auth**: JWT + bcrypt
- **File uploads**: Multer

## Getting Started

### 1. Server
```bash
cd server && npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```

### 2. Client
```bash
cd client && npm install && npm run dev
```

### 3. Seed a membership code (MongoDB shell)
```js
db.membercodes.insertOne({ code: "WELCOME1", used: false })
```

### 4. Make yourself admin (MongoDB shell)
```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Routes
| Path | Access |
|---|---|
| `/` | Public homepage |
| `/login` | Public |
| `/register` | Requires membership code |
| `/members` | Logged-in users |
| `/admin` | Admin only |
