# LuminaFit - Clinical AI Nutrition Platform

LuminaFit is a venture-backed B2B SaaS platform designed to generate highly personalized, hyper-optimized diet plans for gym chains, personal trainers, and clinical nutritionists. 

It leverages a powerful **multi-agent AI pipeline** powered by LLaMA 3.3 70B (via Groq) to analyze a user's biology, fitness goals, and lifestyle, producing macro-perfect nutrition protocols.

## 🚀 Key Features

- **Multi-Agent AI Pipeline**: A robust 3-agent pipeline designed to guarantee zero hallucinations and perfect mathematical macros:
  - *Agent 1 (Generator)*: Drafts the initial protocol based on 20+ onboarding data points.
  - *Agent 2 (Reviewer)*: QA checks the math and verifies zero allergen violations.
  - *Agent 3 (Optimizer)*: Applies corrections and provides a personalized clinical insight.
- **High-Concurrency Ready**: Implements backend round-robin API key rotation using 3 different Groq API keys to easily handle 100+ requests per second without rate-limiting.
- **Clinical Expert Report**: A dedicated, readable `/expert-report` UI designed for dieticians to visually inspect the exact inputs and outputs of the AI Agents, alongside a mathematical confidence score and issue-detection logs.
- **Personalized Floating Chatbot**: A globally accessible AI Dietician chat widget that has secure, direct access to the user's specific clinical profile and their active diet plan.
- **Venture-Standard UI/UX**: Dark-mode aesthetic inspired by Micro1, featuring glassmorphism, fluid Framer Motion animations, interactive components, and full mobile responsiveness (including a mobile sidebar drawer).

## 🛠 Tech Stack

The project is structured as a monorepo containing a frontend and a backend API.

- **Frontend (`apps/web`)**: React 18, TypeScript, Vite, Tailwind CSS (v3), Framer Motion, React Router, Lucide React.
- **Backend (`apps/api`)**: Node.js, Express, TypeScript, Prisma ORM, SQLite (local DB), JWT Auth, bcrypt, Groq SDK.

## 📁 Monorepo Structure

```
Fitness_Wellness/
├── apps/
│   ├── web/        # Frontend React application (Port 5173)
│   └── api/        # Backend Express server & Prisma (Port 3000)
├── package.json    # Root configuration
└── README.md
```

## 🏁 Startup Commands

### Prerequisites
- Node.js (v18 or higher)
- Groq API Keys (Configured in `apps/api/.env`)

### 1. Backend Setup (API)

Navigate to the backend directory:
```bash
cd apps/api
```

Install dependencies:
```bash
npm install
```

Configure Environment Variables (`apps/api/.env`):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret"
GROQ_API_KEY_1="your-key-1"
GROQ_API_KEY_2="your-key-2"
GROQ_API_KEY_3="your-key-3"
```

Run database migrations:
```bash
npx prisma migrate dev
```

Start the Express development server:
```bash
npm run dev
```
*The API will run locally on `http://localhost:3000`.*

### 2. Frontend Setup (Web)

Navigate to the frontend directory:
```bash
cd apps/web
```

Install dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The Web App will run locally on `http://localhost:5173`.*