# 📘 Google Business Profile (GBP) API Integration Guide

This guide provides a comprehensive, step-by-step walkthrough for requesting access, enabling, configuring, and connecting the Google Business Profile (GBP) API to the QRM Dashboard. It includes instructions for navigating the latest **Google Auth Platform** user interface and outlines best practices for collaborative multi-user management.

---

## 📋 Table of Contents
1. [Phase 1: Requesting GBP API Access from Google](#phase-1-requesting-gbp-api-access-from-google)
2. [Phase 2: Enabling the APIs in Google Cloud Console](#phase-2-enabling-the-apis-in-google-cloud-console)
3. [Phase 3: Creating and Configuring OAuth Credentials (Latest UI)](#phase-3-creating-and-configuring-oauth-credentials-latest-ui)
4. [Phase 4: Connecting the Listings to the QRM Dashboard](#phase-4-connecting-the-listings-to-the-qrm-dashboard)
5. [Phase 5: Team Collaboration & Client Onboarding Models](#phase-5-team-collaboration--client-onboarding-models)

---

## Phase 1: Requesting GBP API Access from Google

Unlike standard Google APIs, the Google Business Profile API is restricted. Before you can see or enable it in your Google Cloud Library, you must submit an approval request to Google.

### Step-by-Step Request Process:
1. **Create your Google Cloud Project first**:
   * Log in to the [Google Cloud Console](https://console.cloud.google.com/).
   * Click the project dropdown in the top-left and select **New Project**.
   * Copy the **Project ID** or **Project Number** (e.g., `quantumreach-media-dashboard`). You will need this for the request form.
2. **Access the Request Form**:
   * Navigate to the [Google Business Profile API Prerequisites page](https://developers.google.com/my-business/content/prereqs).
   * Find and click the link to the **Business Profile API request form**.
3. **Fill out the Application Form**:
   * Provide your contact details, company information, and select your target Google Cloud Project using the Project ID/Number you copied.
   * Describe your use case (e.g., *"Building an internal local SEO performance reporting dashboard to schedule posts and sync reviews"*).
4. **Submit and Wait**:
   * Submit the form.
   * Google typically reviews requests within 1-3 business days. Once approved, you will receive a confirmation email stating that your project has access.

---

## Phase 2: Enabling the APIs in Google Cloud Console

Once approved, the APIs will be unlocked for your project. You must enable **two** separate APIs for full dashboard functionality.

### Steps to Enable:
1. Log in to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your approved project in the top-left dropdown.
3. In the top search bar, search for and enable these two APIs:
   * **Google Business Profile API**: Handles location details, local updates, posts, and review feeds.
   * **Business Profile Performance API**: Fetches traffic, search keyword visibility, and customer interaction insights (calls, website clicks, directions).

---

## Phase 3: Creating and Configuring OAuth Credentials (Latest UI)

Google's updated console consolidates all credential operations under the **Google Auth Platform** sidebar menu.

### Step 1: Add Test Users (Audience)
Since your project is in development, Google blocks unauthorized accounts from completing the login screen unless they are registered test users.
1. In the left sidebar of the Google Cloud Console, select **Google Auth Platform** (or search for **OAuth consent screen**).
2. Click the **Audience** tab in the sidebar.
3. Make sure the Publishing status is set to **Testing**.
4. Scroll to the **Test Users** section and click **+ Add Users**.
5. Enter **your partner's/roommate's Google account email** (the account holding the actual business listings).
6. Click **Save**.

### Step 2: Configure Scopes (Data Access)
Tell Google what permissions your dashboard requires:
1. Click the **Data Access** tab in the sidebar.
2. Click **Add or Remove Scopes**.
3. Select or type the scope: `https://www.googleapis.com/auth/business.manage` (to manage Google Business Profiles).
4. Save the changes.

### Step 3: Create OAuth Client Credentials (Clients)
1. Click the **Clients** tab in the sidebar (this replaces the legacy *Credentials* screen).
2. Click **+ Create Credentials** at the top and select **OAuth client ID**.
3. Set the Application Type to **Web application**.
4. Set the name (e.g., `QRM Dashboard Local`).
5. Under **Authorized redirect URIs**, click **+ Add URI** and enter:
   `http://localhost:3000/api/integrations/google/callback`
   > [!IMPORTANT]
   > Make sure the redirect path matches `/api/integrations/google/callback`. Using `/api/auth/google/callback` will cause a `redirect_uri_mismatch` error on login.
6. Click **Create**.

### Step 4: Generate the Client Secret
Because Google no longer allows downloading or viewing existing client secrets after credential creation, you must capture it immediately:
1. On the client details page, look at the **Client secrets** card at the bottom right.
2. Click the **+ Add secret** button.
3. **Copy the Secret Value immediately**. Once you leave this page, it will be permanently masked.
4. Save the values in your project's `.env.local` file:
   ```env
   GOOGLE_CLIENT_ID="your-copied-client-id"
   GOOGLE_CLIENT_SECRET="your-copied-client-secret"
   ```

---

## Phase 4: Connecting the Listings to the QRM Dashboard

The QRM Dashboard uses a **one-time OAuth connection** model. Once established, credentials are saved in the database, and you do not need to repeat these steps.

1. Start your local dashboard dev server:
   ```bash
   pnpm dev
   ```
2. Log in to the QRM Dashboard UI under your admin account.
3. Go to the Settings page and click **Connect Google Business Profile** (handled by `GbpConnectButton`).
4. Google will display the OAuth screen. Sign in using **your partner's Google account** (the one added as a Test User).
5. Grant permissions to view and manage listings.
6. Google redirects back to the callback endpoint, which encrypts the tokens and saves them in the `GbpIntegration` table.
7. The dashboard is now connected to all locations.

---

## Phase 5: Team Collaboration & Client Onboarding Models

For agency operations, managing listings across multiple developers and clients requires clean organization.

### 1. Simultaneous Listing Management
Because the dashboard communicates with Google via saved database credentials, multiple team members can edit listings simultaneously through the dashboard.
* **Example**: Developer A changes the opening hours on Listing 1, while Developer B uploads a photo to Listing 2. The dashboard translates these into separate API queries on the backend concurrently. No collisions occur.

### 2. The Agency Account Model (Simplifying Client Onboarding)
Clients are often reluctant to invite multiple members of your team to their Google profiles. To solve this, utilize a single designated Google account:
1. Create a business-owned Google account (e.g., `integrations@quantumreachmedia.com`).
2. Ask your clients to invite **only** `integrations@quantumreachmedia.com` to manage their listings.
3. Link that single account to the QRM Dashboard.
4. Add your individual developers and writers as users inside the QRM Dashboard.
5. When your team works on clients' listings inside the dashboard, the backend runs the changes through `integrations@quantumreachmedia.com`. The clients never have to know or trust individual developers' Google accounts.

### 3. permanent Delegation (Location Groups)
If you want to maintain control of listings under your own account:
1. Have your partner group their business profiles into a **Location Group** in their [Business Profile Manager](https://business.google.com/).
2. Invite your personal Google email as an **Owner** of that Location Group.
3. Accept the invitation. 
4. Connect the dashboard using your account. You will now see and manage all listings without needing your partner's logins.
