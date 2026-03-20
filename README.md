<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# VitalShield Health Monitor

A real-time health monitoring Progressive Web App (PWA) built with React, TypeScript, and Vite. It streams vital signs from an IoT sensor via ThingSpeak, provides offline clinical analysis, and lets users browse NHS health conditions.

---

## Features

| Feature | Description |
|---|---|
| **Live Dashboard** | Real-time heart rate, SpO₂, body temperature, room environment, and fall-detection alerts |
| **Patient History** | Bar-chart trends + scrollable medical log with CSV export |
| **Health Insights** | Offline clinical evaluation — no AI API required |
| **NHS Conditions** | Browse UK health conditions via the NHS Digital API |
| **User Authentication** | Sign-up / login with SHA-256 hashed passwords stored in `localStorage` |
| **PWA** | Installable on mobile/desktop with offline service-worker support |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [ThingSpeak](https://thingspeak.com/) channel with your IoT sensor data *(optional — mock data is used if not configured)*
- An [NHS Digital API key](https://digital.nhs.uk/developer/api-catalogue/nhs-website-content) *(optional — NHS Conditions tab will show a setup prompt if not configured)*

### 1. Clone & install

```bash
git clone https://github.com/Prabin-de/health-.git
cd health-
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required for the NHS Conditions tab
VITE_NHS_API_KEY=your_nhs_api_key_here
```

> **Note:** The `.env` file is listed in `.gitignore` and will never be committed.

### 3. Configure ThingSpeak *(optional)*

Open the app and navigate to **Configuration** to enter your ThingSpeak channel ID and read API key. Settings are saved in your browser's `localStorage`.

Expected ThingSpeak field mapping:

| Field | Measurement |
|---|---|
| field1 | Body temperature (°C) |
| field2 | SpO₂ (%) |
| field3 | Heart rate (BPM) |
| field4 | Acceleration (G) |
| field5 | Room temperature (°C) |
| field6 | Humidity (% RH) |

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Bundle for production into `dist/` |
| `npm run preview` | Serve the production build locally |

---

## Project Structure

```
health-/
├── components/          # React UI components
│   ├── Auth.tsx         # Login / sign-up form
│   ├── Dashboard.tsx    # Live vitals display
│   ├── ErrorBoundary.tsx# Runtime error recovery
│   ├── HealthInsights.tsx # Offline analysis results
│   ├── History.tsx      # Historical trends + CSV export
│   ├── NHSConditions.tsx# NHS API browser
│   ├── Settings.tsx     # ThingSpeak & threshold config
│   └── VitalCard.tsx    # Reusable vital-sign card
├── contexts/
│   └── AuthContext.tsx  # React Context for auth state
├── services/
│   ├── dbService.ts     # localStorage user database + password hashing
│   ├── localAnalysisService.ts # Offline health analysis engine
│   ├── nhsService.ts    # NHS Digital API client
│   └── thingSpeakService.ts   # ThingSpeak API client + mock data
├── App.tsx              # Main shell with tab routing
├── constants.ts         # Default settings and storage keys
├── db.json              # Initial user database seed
├── index.tsx            # React entry point
├── types.ts             # TypeScript interfaces
└── .env.example         # Environment variable template
```

---

## Technology Stack

- **React 19** with TypeScript
- **Vite 6** for fast builds and HMR
- **Recharts** for live and historical charts
- **Tailwind CSS** (CDN) for styling
- **Font Awesome** (CDN) for icons
- **Web Crypto API** (`crypto.subtle`) for SHA-256 password hashing
- **NHS Digital API** for health condition reference data

---

## Authentication

The app includes a built-in multi-user authentication system:

- Up to **10 registered patients** per browser instance
- Passwords are hashed with **SHA-256** before storage — plain-text passwords are never saved
- Sessions persist across page refreshes via `localStorage`
- All protected routes redirect to the login screen when no session is active

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_NHS_API_KEY` | No* | NHS Digital API subscription key. Without this, the NHS Conditions tab shows a setup prompt. |

\* The rest of the app is fully functional without any environment variables.

