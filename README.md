# Legacy → Modern

> **AI-Powered Legacy Code Modernization & Migration Platform**  
> *Transform legacy code into modern, production-ready applications with AI-assisted modernization, automated behavioral test verification, and AST analysis.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-teal?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

---

## 1. Project Overview

**Legacy → Modern** is a developer platform designed to accelerate code modernization for engineering teams. It bridges the gap between old legacy codebases (jQuery, AngularJS 1.x, Backbone.js, ES5 callback-heavy JavaScript, legacy backend patterns) and modern, type-safe architectures (React 18 + TypeScript, Next.js 14 App Router, modern async/await pipelines).

Unlike standard code formatters or simple chat prompts, **Legacy → Modern** delivers:
- **Intelligent Code Conversion**: Dual-mode engine utilizing Google Gemini API with fallback to an intelligent built-in AST/pattern modernization transformer.
- **Behavioral Test Harness**: Generates unit, behavioral, integration, and regression test cases alongside the converted code to guarantee behavioral equivalence.
- **Interactive Aligned Diff Viewer**: Side-by-side subtle visual inspection highlighting transformed code blocks and deprecated API removals.
- **Relational Persistence**: Full SQLite/PostgreSQL relational database backing via Prisma ORM for User management, Projects, Conversions, and Test Suites.
- **Security & Session Management**: Bcrypt password hashing, JWT session cookies, and user data isolation.

---

## 2. Core Features

- 🔐 **Authentication-First Experience**: Complete registration and login system with bcrypt hashing, duplicate email detection, password strength validation, and JWT session handling.
- ⚡ **Two-Column Aligned Code Editor**: Custom-engineered dual editor (Legacy Input vs Modern Output) with equal width/height, monospaced typography (`JetBrains Mono`), line numbers, format/clear/copy/download actions.
- 🧠 **AI Conversion Pipeline**: Multi-step animated progress visualization (*Analyzing code* → *Detecting patterns* → *Synthesizing modern components* → *Generating tests* → *Validating type soundness*).
- 📊 **Conversion Insights & Audit Trail**: Real-time breakdown of changes count, deprecated APIs removed, dependencies updated, and confidence rating.
- 🧪 **Generated Test Cases & Live Runner**: Interactive test suite with status indicators (`PASS`, `FAIL`, `RUNNING`, `SKIPPED`), execution runner, auto-fix engine, and slide-over detail panel.
- 📁 **Saved Projects Management**: Full project organization with create, rename, delete, and 1-click **Load Demo Project** for instant onboarding.
- 📜 **Conversion History**: Searchable, filterable, and sortable audit history linked directly to the database.
- 🌓 **Precision Dark & Light Themes**: Strict custom color palettes with user preference persisted in the relational database across sessions.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Next.js App Router |
| **Backend** | Node.js, Next.js API Routes, JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`) |
| **Database & ORM**| SQLite (zero-config local dev) / PostgreSQL compatible, Prisma ORM |
| **AI Engine** | Google Gemini API (`gemini-1.5-flash`) + Intelligent Built-in Pattern Synthesizer |
| **Typography** | Inter (UI), JetBrains Mono / Fira Code (Code) |

---

## 4. Database Schema (Prisma ORM)

```prisma
model User {
  id           String          @id @default(uuid())
  name         String
  email        String          @unique
  passwordHash String
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  projects     Project[]
  conversions  Conversion[]
  preferences  UserPreference?
}

model UserPreference {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  theme     String   @default("dark") // "dark" | "light" | "system"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id             String       @id @default(uuid())
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  name           String
  description    String?
  sourceLanguage String       @default("jQuery / JavaScript")
  targetLanguage String       @default("React + TypeScript")
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  conversions    Conversion[]
}

model Conversion {
  id              String     @id @default(uuid())
  projectId       String?
  project         Project?   @relation(fields: [projectId], references: [id], onDelete: SetNull)
  userId          String
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  sourceLanguage  String
  targetLanguage  String
  legacyCode      String
  modernCode      String
  strategy        String
  aiMode          String
  status          String     @default("COMPLETED")
  confidence      Int        @default(94)
  changesCount    Int        @default(12)
  deprecatedCount Int        @default(4)
  depsCount       Int        @default(3)
  insightsJson    String?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  testCases       TestCase[]
}

model TestCase {
  id             String     @id @default(uuid())
  conversionId   String
  conversion     Conversion @relation(fields: [conversionId], references: [id], onDelete: Cascade)
  testName       String
  type           String     @default("Unit")
  status         String     @default("PASS")
  duration       String     @default("14ms")
  scenario       String
  expectedResult String
  actualResult   String
  testCode       String
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
}
```

---

## 5. API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user, hash password, create session cookie & JWT |
| `POST` | `/api/auth/login` | Authenticate user credentials, return JWT & profile |
| `POST` | `/api/auth/logout` | Invalidate authenticated session & clear cookie |
| `GET` | `/api/auth/me` | Fetch authenticated user profile and stats |
| `GET` | `/api/projects` | List all projects belonging to user |
| `POST` | `/api/projects` | Create new project for user |
| `GET` | `/api/projects/:id` | Get specific project and its conversions |
| `PUT` | `/api/projects/:id` | Rename/update project metadata |
| `DELETE` | `/api/projects/:id` | Delete project and associated records |
| `POST` | `/api/projects/demo` | Load full demo suite into database |
| `GET` | `/api/conversions` | List conversions with test counts |
| `POST` | `/api/conversions` | Execute AI conversion, save to DB, generate tests |
| `GET` | `/api/conversions/:id` | Get conversion details and insights |
| `DELETE` | `/api/conversions/:id` | Delete conversion record |
| `GET` | `/api/tests` | List test cases with search & filter |
| `POST` | `/api/tests` | Execute entire test suite |
| `POST` | `/api/tests/:id/run` | Execute individual test case |
| `PUT` | `/api/tests/:id/run` | Auto-fix test case assertions |
| `GET` | `/api/history` | Retrieve user conversion audit history |
| `GET` | `/api/diff/:id` | Retrieve side-by-side aligned diff data |
| `GET` | `/api/preferences` | Retrieve user theme preferences |
| `PUT` | `/api/preferences` | Update and persist theme preference |

---

## 6. Installation & Local Setup

### Prerequisites
- Node.js 18+ (or Node.js 20+)
- npm or pnpm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/your-username/legacy-modern.git
cd legacy-modern
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Default configuration (`.env`):
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-jwt-auth-secret-key-here"
AI_API_KEY="" # Optional: Add Google Gemini API Key for live AI completions
NODE_ENV="development"
PORT=3000
```

### 4. Initialize Database
Run the setup script to initialize the SQLite database tables and generate Prisma Client:
```bash
npm run db:setup
```

*(Optional)* Seed initial showcase data:
```bash
npm run db:seed
```

### 5. Run the Application
Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Demo Accounts

If you ran `npm run db:seed`, you can immediately sign in with:
- **Email**: `demo@legacymodern.dev`
- **Password**: `DemoPass123!`

Or click **Create Account** on the landing page to register your own custom user account!

---

## 8. Theme Palette Specification

| Token | Dark Theme Hex | Light Theme Hex |
|---|---|---|
| **Background** | `#0F1319` | `#F7F8FA` |
| **Surface** | `#171C23` | `#FFFFFF` |
| **Elevated** | `#1D2430` | `#F1F3F6` |
| **Border** | `#2B3440` | `#DCE1E8` |
| **Primary Text** | `#F1F5F9` | `#1D2430` |
| **Secondary Text** | `#98A2B3` | `#667085` |
| **Accent** | `#6D8DFF` | `#4169E1` |
| **Success** | `#39B77A` | `#218653` |
| **Warning** | `#E4A63A` | `#A66B00` |
| **Error** | `#E35D6A` | `#C83C4A` |

---

## 9. License

This project is open source and available under the [MIT License](LICENSE).
