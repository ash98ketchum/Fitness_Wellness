# LuminaFit - Clinical AI Nutrition Platform

LuminaFit is a venture-backed B2B SaaS platform designed to generate highly personalized, hyper-optimized diet plans for gym chains, personal trainers, and clinical nutritionists. 

It leverages a powerful **multi-agent AI pipeline** to analyze a user's biology, fitness goals, and lifestyle, producing macro-perfect nutrition protocols.

## 🚀 Key Features

- **Multi-Agent AI Pipeline**: A robust 3-agent pipeline designed to guarantee zero hallucinations and perfect mathematical macros:
  - *Agent 1 (Generator)*: Drafts the initial protocol based on 20+ onboarding data points.
  - *Agent 2 (Reviewer)*: QA checks the math and verifies zero allergen violations.
  - *Agent 3 (Optimizer)*: Applies corrections and provides a personalized clinical insight.
- **Cross-Platform Parity**: The application supports both a fully responsive Web Application and an identical Native Mobile Application. 
- **Voice-Enabled AI Coach**: A globally accessible AI Dietician chat widget that has secure, direct access to the user's specific clinical profile and their active diet plan, complete with Voice-to-Text inputs.
- **Production-Grade Quality**: The application achieves a premium feel through fluid Framer Motion animations, comprehensive error handling, interactive UI/UX components, and a robust architecture.
- **Automated E2E Testing**: A comprehensive Playwright End-to-End testing suite ensures the reliability of the core flows (Landing -> Authentication -> Onboarding -> Plan Generation -> Dashboard).

## 🛠 Tech Stack

The project is structured as a monorepo containing a web frontend, a mobile frontend, and a backend API.

- **Frontend (`apps/web`)**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, Playwright (E2E).
- **Mobile (`apps/mobile-app`)**: React Native, Expo Router, NativeWind (Tailwind).
- **Backend (`apps/api-server`)**: Node.js, Express, JavaScript, Groq API (LLaMA 3).

## 📁 Monorepo Structure

```
Fitness_Wellness/
├── apps/
│   ├── web/           # Frontend React application (Port 5173)
│   ├── mobile-app/    # React Native Expo application
│   └── api-server/    # Backend Express server for AI Engine (Port 3000)
├── package.json       # Root configuration
└── README.md
```

## 🏁 Startup Commands

### Prerequisites
- Node.js (v18 or higher)
- Groq API Key (Configured in `apps/api-server/.env`)
- Playwright (For E2E Testing)

### 1. Backend Setup (`apps/api-server`)

Navigate to the backend directory:
```bash
cd apps/api-server
npm install
```

Configure Environment Variables (`apps/api-server/.env`):
```env
GROQ_API_KEY="your-groq-api-key"
PORT=3000
```

Start the Express development server:
```bash
npm start
```
*The API will run locally on `http://localhost:3000`.*

### 2. Frontend Setup (`apps/web`)

Navigate to the frontend directory:
```bash
cd apps/web
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The Web App will run locally on `http://localhost:5173`.*

### 3. Mobile Setup (`apps/mobile-app`)

Navigate to the mobile directory:
```bash
cd apps/mobile-app
npm install
```

Start the Expo development server:
```bash
npx expo start
```

### 4. Running E2E Tests (Playwright)

With both the API Server and Web Server running:
```bash
cd apps/web
npx playwright test
```
*Screenshots of the run are automatically captured in `apps/web/tests/screenshots/`.*