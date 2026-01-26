# Migration Guide: Moving to Linux & Cloudflare Setup

This project consists of a **Next.js Frontend**, a **Node.js/Express Backend**, and uses **Cloudflare Tunnel** for public access.

## ⚠️ CRITICAL CONFIGURATION (Do this first!)

There is a port mismatch in the default code that **MUST** be fixed via Environment Variables on your new machine.

* **Frontend Config**: Expects Backend on Port **5000** (via `next.config.js` rewrites).
* **Cloudflare Config**: Expects Backend on Port **5000**.
* **Backend Default**: Runs on Port **5001** (by default).

**REQUIRED ACTION:** You MUST set `PORT=5000` in the Backend's `.env` file.

---

## 🚀 Setup Steps on Linux

### 1. Backend Setup

Navigate to the `backend` directory.

1. **Install Dependencies:**

    ```bash
    cd backend
    npm install
    ```

2. **Create `.env` File:**
    Create a file named `.env` in the `backend` folder with the following content:

    ```env
    PORT=5000
    NODE_ENV=production
    MONGODB_URI=mongodb://localhost:27017/minichat  # Or your actual MongoDB URL
    JWT_SECRET=your_super_secret_jwt_key
    
    # CORS Configuration (Important for Subdomains)
    ALLOWED_ORIGINS=https://chat.clubfivem.com,http://localhost:3000,https://api.clubfivem.com
    ```

3. **Start Backend:**

    ```bash
    npm start
    ```

    *Ensure it says "Server running on <http://localhost:5000>"*

### 2. Frontend Setup

Navigate to the `frontend` directory.

1. **Install Dependencies:**

    ```bash
    cd frontend
    npm install
    ```

2. **Create `.env.production` File:**
    Create a file named `.env.production` in the `frontend` folder:

    ```env
    # Points to the Frontend itself (which forwards to Backend via Rewrites)
    # OR points directly to the backend API domain
    NEXT_PUBLIC_API_URL=https://chat.clubfivem.com/api
    ```

3. **Build and Start:**

    ```bash
    npm run build
    npm start
    ```

    *Frontend will run on port 3000.*

### 3. Cloudflare Tunnel Setup

To make your subdomains (`chat.clubfivem.com`, etc.) work, you need to run the tunnel with the `cloudflared` tool.

1. **Install cloudflared:** (Arch Linux example, use apt/yum for others)

    ```bash
    sudo pacman -S cloudflared
    ```

2. **Move Credentials:**
    * Find the file `d26fba95-f796-45e3-96dd-7e0b3bbd867a.json` from your backup (it was in `C:\Users\Marke\.cloudflared\` on Windows).
    * Move it to `~/.cloudflared/` on Linux.
3. **Run Tunnel:**
    Use the provided config file `cloudflared-config.yml`.

    ```bash
    cloudflared tunnel --config cloudflared-config.yml run
    ```

---

## 🔍 Architecture Overview

* **chat.clubfivem.com** -> Cloudflare -> **Frontend (Port 3000)**
  * When you call `/api/...` here, Next.js rewrites it to `http://localhost:5000/api/...`.
* **api.clubfivem.com** -> Cloudflare -> **Backend (Port 5000)**
  * Direct access to API.
* **pos.clubfivem.com** -> Cloudflare -> **POS Service (Port 8080)**

## 🛠 Troubleshooting

* **"Connection Refused" on /api**:
  * Check if Backend is running.
  * Check if Backend is on port **5000** (not 5001).
* **CORS Errors**:
  * Ensure `ALLOWED_ORIGINS` in Backend `.env` includes `https://chat.clubfivem.com`.
