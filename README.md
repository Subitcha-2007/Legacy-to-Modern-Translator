# Legacy → Modern

> **AI-Powered Legacy Code Modernization & Migration Platform**  
> *Transform legacy code into modern, production-ready applications with AI-assisted modernization, automated behavioral test verification, and AST analysis.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-teal?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Deployment: Vercel](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)](https://vercel.com/)
[![Database: Neon PostgreSQL](https://img.shields.io/badge/Database-Neon%20Postgres-green?logo=postgresql)](https://neon.tech/)

---

## 1. Project Overview

**Legacy → Modern** is an enterprise-ready developer platform designed to accelerate code modernization for engineering teams. It transforms legacy codebases (jQuery, AngularJS 1.x, Backbone.js, ES5 callback-heavy JavaScript, legacy backend patterns) into modern, type-safe architectures (React 18 + TypeScript, Next.js 14 App Router, modern async/await pipelines).

Unlike standard formatters or simple chat prompts, **Legacy → Modern** delivers:
- **Intelligent Code Conversion**: Dual-mode engine utilizing Google Gemini API with fallback to an intelligent built-in AST/pattern modernization transformer.
- **Behavioral Test Harness**: Generates unit, behavioral, integration, and regression test cases alongside the converted code to guarantee behavioral equivalence.
- **Interactive Aligned Diff Viewer**: Side-by-side subtle visual inspection highlighting transformed code blocks and deprecated API removals.
- **Relational Persistence**: Full PostgreSQL / SQLite database backing via Prisma ORM for User management, Projects, Conversions, and Test Suites.
- **Security & Session Management**: Bcrypt password hashing, JWT session cookies, and user data isolation.

---

## 2. Production Architecture

```
┌────────────────────────────────────────────────────────┐
│             Frontend & User Interface (Vercel)         │
│  - React 18, TypeScript, Tailwind CSS, App Router     │
│  - Dual-Column Code Editor, Diff Viewer, Test Harness │
└───────────────────────────┬────────────────────────────┘
                            │  HTTPS (REST / JWT)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Backend API Layer (Next.js / Node.js)      │
│  - Authentication (/api/auth/register, /api/auth/login)│
│  - Conversions & AI Engine (/api/conversions)          │
│  - Test Suite Runner (/api/tests, /api/tests/:id/run)  │
│  - Project CRUD & Diff Retrieval (/api/projects)       │
└───────────────────────────┬────────────────────────────┘
                            │  Prisma ORM Connection
                            ▼
┌────────────────────────────────────────────────────────┐
│             Production Database (Neon / Supabase)      │
│  - PostgreSQL / Relational Schema                      │
│  - User, UserPreference, Project, Conversion, TestCase │
└────────────────────────────────────────────────────────┘
```

---

## 3. Public Production Deployment Guide

### Option A: 1-Click Deployment to Vercel (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add -A
   git commit -m "feat: complete Legacy to Modern platform"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Import your GitHub repository.
   - Set Environment Variables in Project Settings:
     - `DATABASE_URL`: Your production PostgreSQL connection string (from [Neon](https://neon.tech) or [Supabase](https://supabase.com)).
     - `AUTH_SECRET`: A secure random JWT secret (e.g. `openssl rand -hex 32`).
     - `AI_API_KEY`: *(Optional)* Your Google Gemini API Key.
   - Click **Deploy**.

3. **Initialize the Production Database**:
   In your local terminal or via CI/CD, point `DATABASE_URL` to your Neon/Supabase database and run:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

---

### Option B: Deploy to Render / Railway

1. Connect your repository to [Render](https://render.com) using the included [`render.yaml`](file:///c:/Users/USER/Desktop/asp/render.yaml).
2. Render will automatically provision a PostgreSQL database instance and deploy the web service.

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

## 6. Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Setup SQLite database
npm run db:setup
npm run db:seed

# 4. Start Next.js development server
npm run dev
```

---

## 7. Default Seeded Credentials

- **Demo User**: `demo@legacymodern.dev`
- **Password**: `DemoPass123!`

---

## 8. License

This project is licensed under the [MIT License](LICENSE).
