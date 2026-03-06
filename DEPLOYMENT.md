# Happy Hackers Clubs - Deployment Guide

This project is configured to run smoothly on modern cloud PaaS solutions.

## Architecture
- **Frontend**: Next.js (Vercel)
- **Backend**: Node.js + Express (Render)
- **Database**: PostgreSQL (Neon Serverless Db)

---

## 🚀 Deployment Instructions

### 1. Database Setup (Neon PostgreSQL)
1. Navigate to [Neon](https://neon.tech) and create a new project.
2. Copy the **Connection String** provided. 
3. Open `backend/.env` (or use cloud env vars) and set:
   `DATABASE_URL="postgresql://user:password@neon-host..."`
4. Locally inside `backend/`, run `npx prisma db push` to push the initial schema.

### 2. Backend Deployment (Render)
1. Upload the `backend` folder to a GitHub repository or subfolder.
2. Inside Render, select **Web Service**, connect your GitHub repo, and point to the `backend/` directory.
3. Configure the commands for Render:
   - Build Command: `npm install express cors dotenv jsonwebtoken bcrypt socket.io multer @prisma/client node-cron && npx prisma generate`
   - Start Command: `node server.js`
4. Set Environment Variables in Render:
   - `DATABASE_URL` = neon db url
   - `JWT_SECRET` = your secret key string (e.g. `123123123supersecret`)
   - `PORT` = `10000` (Render's internal standard, default is handled) 

### 3. Frontend Deployment (Vercel)
1. Add standard `package.json` configurations to your `frontend/` directory (already included).
2. Connect your repository to Vercel. 
3. Specify the **Root Directory** as `frontend` in Project Settings.
4. Set Environment Variables in Vercel:
   - `NEXT_PUBLIC_API_URL` = URL provided by Render + `/api` (e.g., `https://happy-hackers-backend.onrender.com/api`)
   - `NEXT_PUBLIC_SOCKET_URL` = URL provided by Render (e.g., `https://happy-hackers-backend.onrender.com`)
5. Click **Deploy**. Vercel will automatically run `npm install` and `npm run build`.

## Local Development
- Inside `/backend`, run: `npm run dev`
- Inside `/frontend`, run: `npm run dev`
