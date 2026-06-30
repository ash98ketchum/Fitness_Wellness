# Athelya - Clinical AI Nutrition Platform

LuminaFit is a venture-backed B2B SaaS platform designed to generate highly personalized, hyper-optimized diet plans for gym chains, personal trainers, and clinical nutritionists. 

It leverages a powerful **multi-agent AI pipeline** to analyze a user's biology, fitness goals, and lifestyle, producing macro-perfect nutrition protocols.

## 🌊 Application Data Flow

1. **Landing Page (`/`)**: 
   - The initial entry point. Displays the platform's value proposition.
   - Users can choose to **Log In** or **Get Started**. No other internal options are accessible without authentication.
2. **Authentication (`/signup` & `/login`)**:
   - New users provide their Full Name, Email, and Password.
   - If a user tries to sign up with an existing email, the database catches it and they are prompted to log in.
3. **Onboarding Questionnaire (`/onboarding`)**:
   - A comprehensive multi-step flow capturing 20+ clinical metrics for the AI:
     - *Step 1*: Age, Gender, Weight, Height, Body Fat %, Activity Level.
     - *Step 2*: Primary Goal, Target Weight, Target Body Fat, Timeframe.
     - *Step 3*: Dietary Preferences (Keto, Vegan, etc.), Allergies, Disliked Foods.
     - *Step 4*: Meals Per Day, Cooking Skill, Budget.
     - *Step 5*: Water Intake, Sleep, Stress Level, Supplements, Medical Conditions.
4. **AI Generation (`/loading`)**:
   - Upon completing onboarding, the multi-agent AI pipeline engages to draft, review, and optimize the custom diet plan.
5. **Dashboard (`/dashboard`)**:
   - The user's central hub. If a plan exists, it displays the active protocol. If not, they are prompted to generate one.
   - Shows a visual grid of Target vs. Actual Calories and Macros.
   - Lists the timeline of meals for the day.
   - Presents the "Nutrition Expert" AI Insight card containing the model's rationale.
6. **Meal Details (`/meal/:id`)**:
   - Accessed by clicking a meal from the dashboard. Shows exact portion-mapped ingredients, prep time, difficulty, and numbered cooking instructions.
   - Features an embedded, context-aware Cooking Assistant chatbot for recipe substitutions.
7. **Weekly Planner & Settings (`/planner`, `/settings`)**:
   - Allows users to view their week at a glance and regenerate individual meals.
8. **Global AI Assistant**:
   - A floating chat panel accessible anywhere in the dashboard for general nutrition advice.

## 🚀 Key Features

- **Multi-Agent AI Diet Pipeline**: A robust 3-agent pipeline designed to guarantee zero hallucinations and perfect mathematical macros:
  - *Agent 1 (Generator)*: Drafts the initial protocol based on 20+ onboarding data points.
  - *Agent 2 (Reviewer)*: QA checks the math and verifies zero allergen violations.
  - *Agent 3 (Optimizer)*: Applies corrections and provides a personalized clinical insight.
- **Active Workout Coach & Tracking**: Start workouts with interactive UI. Features an AI "Hype Trainer" and "Biomechanics Coach" you can chat with.
- **Hands-Free Voice Tracking**: Log workout sets, reps, and weight purely with your voice while the AI speaks back affirmations, form tips, and hydration reminders using Text-to-Speech (TTS). Auto-syncs to the database.
- **AI Recipe Assistant**: Step-by-step cooking view with continuous hands-free voice mode and TTS reading. 
- **Cross-Platform Parity**: The application supports both a fully responsive Web Application and an identical Native Mobile Application.
- **Production-Grade Quality**: The application achieves a premium feel through fluid Framer Motion animations, interactive UI/UX components, and a robust architecture.

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


Jivence persistence of constant vitality
gaps
ui
admin logins/dashboard
original - 15.99
pure gym 9.99(subscription) - 0.99(gym)
2.5 M
3000/gym 
montly gym avg - 20
expected users -> 
coupons 


