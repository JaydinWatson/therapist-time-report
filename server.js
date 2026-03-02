# Therapist Time Report — Render Deployment Guide

## What this is
A small Node.js server that:
1. Acts as a proxy between your browser and the Cliniko API (bypassing CORS restrictions)
2. Serves the dashboard at your own private URL

---

## Step-by-step: Deploy to Render (free)

### 1. Create a GitHub account (if you don't have one)
Go to https://github.com and sign up.

### 2. Create a new repository
1. Click the **+** icon → **New repository**
2. Name it `therapist-time-report`
3. Set it to **Private**
4. Click **Create repository**

### 3. Upload these files
In your new repository, click **Add file → Upload files** and upload:
- `server.js`
- `package.json`
- The `public/` folder (containing `index.html`)

### 4. Create a Render account
Go to https://render.com and sign up with your GitHub account.

### 5. Deploy on Render
1. Click **New → Web Service**
2. Connect your GitHub repo (`therapist-time-report`)
3. Fill in:
   - **Name**: therapist-time-report (or anything you like)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Click **Create Web Service**

Render will build and deploy in ~2 minutes.
You'll get a URL like: `https://therapist-time-report.onrender.com`

---

## Using the dashboard
1. Open your Render URL in any browser
2. Go to **Cliniko → My Info → API Keys** and create a new key
3. Paste the key into the dashboard and select your region
4. Click **Load Data**

The dashboard will auto-refresh every Friday at 3:15pm AEST.

---

## Notes
- The free Render tier spins down after 15 min of inactivity (cold start ~30 sec)
- Your API key is never stored on the server — it's sent with each request from your browser
- To keep it always-on, upgrade to Render's $7/month plan
