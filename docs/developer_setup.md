# 🛠️ Developer Setup & Action Items Checklist

This document serves as the centralized developer action reference log for configuring, running, and testing the Quantum Reach Media dashboard. Keep this checklist updated as new configuration requirements arise.

---

## 📋 Centralized Setup Actions

### 1. Database Setup (Local Docker Stack)
If you are developing locally and want a self-hosted PostgreSQL database and Redis queue:
1. **Start Docker Stack**:
   ```bash
   docker compose -f docker/docker-compose.dev.yml up -d
   ```
   *This starts PostgreSQL, Redis, and Mailpit (local email capture).*
2. **Verify Database connection** in `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qrm_dashboard?schema=public&connection_limit=10"
   REDIS_URL="redis://localhost:6379"
   ```
3. **Execute migrations & Seed database**:
   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

---

### 2. Database Setup (Cloud Supabase Option)
To host your database on **Supabase** (either using Direct Connection or Connection Pooler):

#### Method A: Direct Connection (Default)
1. Go to your [Supabase Dashboard](https://supabase.com).
2. Click **Connect** (green button at the top header) or navigate to **Settings (Gear Icon) -> Database**.
3. Under *Connection string*, choose **URI** and copy the string. It will look like:
   `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`
4. Replace `[YOUR-PASSWORD]` (percent-encode special characters like `@` as `%40`).

#### Method B: Connection Pooler (Recommended for Port 5432 Blocks / Windows Connection Issues)
If you get connection timeouts (Prisma Error `P1001: Can't reach database server`), your ISP or firewall may be blocking database traffic on port `5432`. Use the **Supabase Connection Pooler**:
1. Go to your **Supabase Dashboard** -> **Settings** -> **Database**.
2. Scroll to the **Connection Pooler** section and toggle it **ON**.
3. Select connection mode **Transaction** or **Session**.
4. Copy the connection string. It will look like:
   `postgres://postgres.xxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
5. Note that the port is `6543` and username includes your project ID (e.g. `postgres.xxxx`).

#### Syncing Database:
1. Save the connection string in your local `.env` and `.env.local` files:
   ```env
   DATABASE_URL="postgres://postgres.xxxx:your_percent_encoded_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
2. Open terminal in the project root and run schema sync:
   ```bash
   npx prisma db push
   ```
3. Seed the database tables:
   ```bash
   npx prisma db seed
   ```

---

### 3. Bot Protection (Cloudflare Turnstile)
To test and protect your registration/login portals from scripts/bots:
1. **Register site**:
   - Access the [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile).
   - Add a widget for domain `localhost`.
   - Copy the **Site Key** and **Secret Key**.
2. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-cloudflare-site-key"
   CLOUDFLARE_TURNSTILE_SECRET="your-cloudflare-secret-key"
   ```
   *Note: If left blank in local development, server action validators will bypass Turnstile check so you can test without key configuration.*

---

### 4. NextAuth Secret Key Setup
NextAuth requires a secure random token to sign and verify JWT keys:
1. **Generate token**:
   Run this command in your terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
2. **Add to `.env.local`**:
   ```env
   NEXTAUTH_SECRET="your-generated-base64-string"
   NEXTAUTH_URL="http://localhost:3000"
   ```

---

### 5. Transactional Email Checks (Mailpit / Resend)
When testing password reset links:
1. **Local environment (Mailpit)**:
   - Make sure your local Docker container is running.
   - Leave `RESEND_API_KEY` empty or blank in `.env.local`.
   - Access `http://localhost:8025` in your browser. All password reset emails will be sent here automatically.
2. **Production environment (Resend)**:
   - Create a free account on [Resend](https://resend.com).
   - Generate an API Key.
   - Add to `.env.local`:
     ```env
     RESEND_API_KEY="re_xxxxxxx"
     ```

---

## 🔑 Default Test Accounts
After seeding the database (`pnpm prisma db seed`), use these credentials to log in:

- **Agency Owner (Super Admin)**:
  - **Email**: `admin@quantumreachmedia.com`
  - **Password**: `password123`
- **SEO Specialist**:
  - **Email**: `specialist@quantumreachmedia.com`
  - **Password**: `password123`
