# 🔐 Quantum Reach Media — Authentication & Database Setup Architecture

This document describes the design, security protocols, and integration setup for the NextAuth.js authentication system, password recovery flow, and bot protection stack.

---

## 1. Core Architecture Overview

We use **NextAuth.js (Auth.js v5)** using the **JWT Session Strategy**. This allows us to scale horizontally and check roles inside the Next.js edge runtime without hitting the database on every page visit.

```
[Client App] ---> [Middleware (Check Role)] ---> [Protected Pages]
     |
     v
[Credentials/OAuth] ---> [NextAuth Handler] ---> [Database User Lookup]
```

### Authentication Pipeline
1. **Credentials Login**: Takes `email` and `password`. The password comparison uses **bcryptjs** (12 rounds) on the server.
2. **OAuth Provider**: Allows users to sign in instantly via Google or GitHub.
3. **Session Enrichment**: Custom callbacks in `src/lib/auth.ts` copy the database `role` parameter to the JWT token and front-end session object.
4. **Account Invalidation**: A custom check validation in `src/lib/auth.ts` checks `user.isActive`. If `false`, the session is terminated.

---

## 2. Supabase (PostgreSQL) Cloud Setup

For database storage, we use **PostgreSQL**. To deploy a free cloud database on **Supabase**, follow these steps:

1. **Sign In**: Navigate to [Supabase](https://supabase.com) and click **Sign In** (you can sign in directly using your GitHub account).
2. **Create Project**:
   - Click **New Project** and choose your organization.
   - Enter a project name (e.g. `qrm-dashboard`).
   - Create a secure database password (copy this password; you will need it for the connection string).
   - Select the closest hosting region.
   - Click **Create new project**.
3. **Retrieve Database Connection String**:
   - Once the project is provisioned, go to the left sidebar and click **Settings (Gear Icon)** -> **Database**.
   - Scroll down to **Connection string** and select **URI**.
   - Copy the string. It will look like:
     `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`
4. **Update Environment**:
   - Open your local `.env.local` and set:
     ```env
     DATABASE_URL="postgresql://postgres:your-chosen-password@db.xxxx.supabase.co:5432/postgres?pgbouncer=true"
     ```
     *(Note: Add `?pgbouncer=true` if you are using connection pooling inside serverless Next.js operations).*
5. **Sync Schemas**:
   - Run the following terminal command to sync all Prisma models to your new Supabase database:
     ```bash
     pnpm prisma db push
     ```

---

## 3. Bot Protection (Cloudflare Turnstile) Setup

To protect signups and logins from robotic attacks, we integrate Cloudflare Turnstile:

1. **Get Keys**:
   - Access the [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile).
   - Add a site with your domain (`localhost` in development).
   - Copy the **Site Key** (Public) and **Secret Key** (Private).
2. **Configure Environment Variables**:
   - Save the credentials in your local `.env.local`:
     ```env
     NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
     CLOUDFLARE_TURNSTILE_SECRET="1x000000000000000000000000000000AA"
     ```
3. **Verification Handshake**:
   - The frontend passes the solved token widget value (`cf-turnstile-response`) to the server.
   - The server verifies it by making a POST request to:
     `https://challenges.cloudflare.com/turnstile/v0/siteverify`

---

## 4. Password Recovery flow

- **Verification Token Model**: Verification tokens are stored in the database (`VerificationToken` table) with the hash identifier, secret token, and a 1-hour expiry date.
- **Mailer Integration**: Emails are sent using the **Resend** gateway. In a local testing environment, they are captured inside the **Mailpit** inbox container at `http://localhost:8025`.
- **Reset Forms**: Located at `/reset-password?token=xxxx`. It checks the token integrity, lets the user change their password, and replaces the database record.
