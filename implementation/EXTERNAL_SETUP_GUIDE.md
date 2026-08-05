# 🔑 Quantum Reach Media — External Setup & Credentials Guide

This guide outlines the step-by-step procedures for setting up the external accounts, generating API keys, and configuring environment variables required to run the QRM Dashboard in both development and production environments.

---

## 📋 Table of Contents
1. [NextAuth.js & Security Setup](#1-nextauthjs--security-setup)
2. [Local Database & Cache Stack (Docker)](#2-local-database--cache-stack-docker)
3. [LLM & AI API Keys](#3-llm--ai-api-keys)
4. [Cloudflare R2 Object Storage](#4-cloudflare-r2-object-storage)
5. [DataForSEO API Integrations](#5-dataforseo-api-integrations)
6. [Google Cloud Platform & Google Business Profile (GBP) API](#6-google-cloud-platform--google-business-profile-gbp-api)
7. [Observability (Sentry & Pino)](#7-observability-sentry--pino)
8. [Transactional Email (Resend)](#8-transactional-email-resend)

---

## 1. NextAuth.js & Security Setup

NextAuth.js requires a secret key to encrypt JSON Web Tokens (JWTs) and secure user sessions.

### Steps to Generate:
1. **Open your terminal** (PowerShell, Bash, or Command Prompt).
2. **Run the following command** to generate a secure 32-character random string:
   ```bash
   openssl rand -base64 32
   ```
   *If you do not have OpenSSL installed, you can run:*
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
3. **Copy the generated key** and paste it into your `.env.local` file:
   ```env
   NEXTAUTH_SECRET="your-generated-base64-string"
   NEXTAUTH_URL="http://localhost:3000"
   ```

---

## 2. Local Database & Cache Stack (Docker)

The application uses PostgreSQL 16 for persistent storage and Redis 7 for queue management (BullMQ) and rate limiting.

### Steps to Setup:
1. **Install Docker Desktop**: Download and install it from [Docker's official site](https://www.docker.com/products/docker-desktop/).
2. **Start the local stack**: Navigate to your project directory and run:
   ```bash
   docker compose -f docker/docker-compose.dev.yml up -d
   ```
   This will spin up PostgreSQL, Redis, and Mailpit (for local email capture).
3. **Configure your Database and Redis URLs** in `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qrm_dashboard?schema=public&connection_limit=10"
   REDIS_URL="redis://localhost:6379"
   ```
4. **Run migrations and seed data**:
   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

---

## 3. LLM & AI API Keys

We utilize three API providers to ensure fast generation times and seamless fallback redirection.

### A. Groq API (Primary Generation)
Groq provides ultra-fast LLM inference (Llama-3 models).
1. Go to the [Groq Console](https://console.groq.com/).
2. Create an account or sign in.
3. Navigate to **API Keys** and click **Create API Key**.
4. Set in `.env.local`:
   ```env
   GROQ_API_KEY="gsk_..."
   ```

### B. Cerebras API (Alternative Generation)
Cerebras offers high-speed AI inference.
1. Sign up/in at the [Cerebras Developer Portal](https://cloud.cerebras.ai/).
2. Navigate to your dashboard and generate a new API key.
3. Set in `.env.local`:
   ```env
   CEREBRAS_API_KEY="csk_..."
   ```

### C. Google Gemini API (Fallback / Multimodal Post Generation)
Gemini is used for visual/image reference generation.
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key**.
3. Create a key in a new or existing Google Cloud project.
4. Set in `.env.local`:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```

---

## 4. Cloudflare R2 Object Storage

Cloudflare R2 is an S3-compatible object storage service with zero egress fees, ideal for storing GBP post images and generated content assets.

### Steps to Setup:
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Click on **R2 Object Storage** in the sidebar.
3. Click **Create bucket**, name it (e.g., `qrm-dashboard-assets`), and choose your region.
4. Go back to R2 overview page and click **Manage R2 API Tokens** on the right side.
5. Click **Create API token**:
   - Provide a name (e.g., `QRM Dev Token`).
   - Grant **Read & Write** permissions.
   - Click **Create API Token**.
6. Copy the **Access Key ID**, **Secret Access Key**, and **Jurisdiction-specific Endpoint URL** (the Account ID is part of this URL).
7. Configure in `.env.local`:
   ```env
   R2_ACCOUNT_ID="your-cloudflare-account-id"
   R2_ACCESS_KEY_ID="your-access-key-id"
   R2_SECRET_ACCESS_KEY="your-secret-access-key"
   R2_BUCKET_NAME="qrm-dashboard-assets"
   ```

---

## 5. DataForSEO API Integrations

DataForSEO provides SERP tracking, keyword research, and competitor metrics.

### Steps to Setup:
1. Register an account at [DataForSEO](https://dataforseo.com/).
2. Navigate to your dashboard to find your **API Login** and **API Password** (API Key).
3. Set them in `.env.local`:
   ```env
   DATAFORSEO_LOGIN="your-registered-email-or-username"
   DATAFORSEO_PASSWORD="your-api-password-hash"
   ```

---

## 6. Google Cloud Platform & Google Business Profile (GBP) API

Required to list local businesses, sync reviews, generate map rank grids, and automate social posting.

### A. OAuth 2.0 Credentials (User Syncing)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `Quantum Reach Media`).
3. Configure the **OAuth Consent Screen**:
   - Set User Type to **External**.
   - Add required scopes: `https://www.googleapis.com/auth/business.manage` (Google Business Profile API).
   - Add test users (your agency email).
4. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**:
   - Application type: **Web application**.
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (and your production URL equivalent).
5. Copy the **Client ID** and **Client Secret**:
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

### B. Maps Platform API Key (Grid Rank Dashboard)
1. In the same GCP project, go to **APIs & Services** -> **Library**.
2. Search and enable:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
3. Go to **Credentials** -> **Create Credentials** -> **API key**.
4. Restrict this key to HTTP referrers in production.
5. Set in `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_KEY="your-maps-api-key"
   ```

### C. Mapbox Access Token (Alternative Geocoding)
1. Sign up for a free account at [Mapbox](https://www.mapbox.com/).
2. Navigate to your Mapbox Account Dashboard.
3. Under **Access tokens**, copy your **Default public token** (or create a new one).
4. Set in `.env.local`:
   ```env
   MAPBOX_ACCESS_TOKEN="pk.eyJ1..."
   ```

---

## 7. Observability (Sentry & Pino)

We use Sentry for production exception catching and telemetry.

### Steps to Setup:
1. Sign up/in at [Sentry.io](https://sentry.io/).
2. Create a new Project:
   - Platform: **Next.js**.
   - Name: `qrm-dashboard`.
3. Copy the **DSN** from the client/server SDK setup instructions.
4. Set in `.env.local`:
   ```env
   SENTRY_DSN="https://key@sentry.io/project"
   ```

---

## 8. Transactional Email (Resend)

Resend sends out service agreements, lead status alerts, and daily notifications.

### Steps to Setup:
1. Sign up at [Resend](https://resend.com/).
2. Go to **API Keys** and click **Create API Key**.
3. Go to **Domains** and add your custom agency domain (e.g., `quantumreachmedia.com`) to setup SPF/DKIM DNS records (recommended for production deliverability).
4. Set in `.env.local`:
   ```env
   RESEND_API_KEY="re_..."
   ```
