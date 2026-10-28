# Civic Connect — CIRRS Municipal & Super Admin Platform

Full-stack Civic Issue Reporting & Resolution System (CIRRS) built with **React + Vite + Tailwind CSS + Express + Supabase**.

---

## 1. अपने Local System (VS Code / Windows / Mac / Linux) पर कैसे चलाएं

### Prerequisites
- **Node.js** (v18 या v20+ इंस्टॉल होना चाहिए — [nodejs.org](https://nodejs.org))

### Step 1: Project Folder खोलें और Packages Install करें
प्रोजेक्ट को डाउनलोड/अनज़िप करके VS Code टर्मिनल में खोलें और चलाएं:
```bash
npm install
```

### Step 2: `.env` फाइल बनाएं
रूट फोल्डर में `.env.example` की कॉपी बनाकर उसका नाम `.env` रखें:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-api-key"
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="your-anon-public-api-key"
```
*(नोट: यदि आप बिना Supabase के भी लोकल टेस्ट करना चाहते हैं, तो भी `server.js` का लोकल इंजन ऑटोमैटिकली काम करेगा।)*

### Step 3: Local Server (Frontend + Backend एक साथ) चालू करें
```bash
npm run dev
```
यह एक ही कमांड **Frontend (Vite)** और **Backend (Express API)** दोनों को एक साथ **`http://localhost:3000`** पर चालू कर देगी!

---

## 2. Local URLs और Login Credentials

### A. Citizen & Municipal Officer Portal
- **URL**: [http://localhost:3000/](http://localhost:3000/)
- **Demo Citizen Login**:
  - **Email**: `priya.sharma@example.com`
  - **Password**: `PriyaSecure#2026`
- **Demo Municipal Officer Login**:
  - **Email**: `rajesh.sharma@indore.gov.in`
  - **Password**: `CivicConnect#2026`

### B. Secret Super Admin Console (Isolated Route)
- **URL**: [http://localhost:3000/civic-connect/admin/login](http://localhost:3000/civic-connect/admin/login)
- **Super Admin Credentials**:
  - **Email**: `cirrs-hq@gov.in`
  - **Password**: `Admin#CIRRS2026`
  - **Secret Key (नया Admin बनाने के लिए)**: `CIRRS-ADMIN-2026`

---

## 3. Two-Tier Verification Workflow (कैसे टेस्ट करें)
1. **Citizen Account**:
   - `http://localhost:3000` पर जाकर नया Citizen रजिस्टर करें → ईमेल वेरीफाई करें → तुरंत लॉगिन हो जाएगा।
2. **Municipal Officer Account**:
   - `http://localhost:3000` पर जाकर **Municipal Officer** रजिस्टर करें → ईमेल वेरीफाई करें (Step 1)।
   - अभी लॉगिन करने पर **Pending Admin Verification** दिखेगा और लॉगिन ब्लॉक रहेगा।
   - अब `http://localhost:3000/civic-connect/admin/login` खोलकर Super Admin से लॉगिन करें → **Municipality Management** में जाकर उस ऑफिसर को **Verify & Approve** करें (Step 2)।
   - अब वह Municipal Officer लॉगिन कर सकता है!
