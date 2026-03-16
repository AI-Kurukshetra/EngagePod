# EngagePod

EngagePod is a full-stack, real-time classroom engagement platform built for K–12 schools. Teachers can create interactive lessons, launch live sessions, and track student performance — all from a single, unified dashboard. Students participate through assignments and real-time activities, while parents and admins have dedicated views to monitor progress.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [Pages & Routes](#pages--routes)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Deployment](#deployment)

---

## Features

- **Live Sessions** — Teachers launch sessions from lessons; students join and respond in real time with engagement scores and response rates tracked automatically.
- **Lesson Builder** — A studio-style editor for creating multi-activity lessons with support for quiz, poll, draw, open-ended, collaboration, video, and virtual field-trip activity types.
- **Assignment Workspace** — Teachers assign lessons to classrooms; students complete them at their own pace with MCQ attempts recorded.
- **Library Management** — Organize lessons into folders with a full folder/item hierarchy. Supports featured and AI-assisted lesson flags.
- **Analytics & Reporting** — Per-classroom and per-session analytics including completion rates, engagement scores, and streak tracking for students.
- **Multi-Role Access** — Role-based UIs for teachers, students, parents, admins, and instructional coaches.
- **Admin Panel** — School and district-level administration with user management, classroom oversight, and library controls.
- **Parent Dashboard** — Parents can monitor their child's assignments, streaks, and session history.
- **Notifications** — In-app notification system for session updates, assignment completions, and admin alerts.
- **Authentication** — Email/password login and registration via Supabase Auth with SSR session management and middleware-protected routes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Server Components) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, Lucide React icons |
| Backend / DB | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage) |
| Validation | Zod v4 |
| Date Utilities | date-fns v4 |
| Testing | Vitest + Testing Library (React) + jsdom |
| Linting | ESLint 9 with eslint-config-next |
| Styling Utilities | clsx, tailwind-merge |

---

## Project Structure

```
engagepod/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Public auth routes
│   │   │   ├── login/           # Login page
│   │   │   └── register/        # Registration page
│   │   ├── (dashboard)/         # Protected app shell (requires auth)
│   │   │   ├── dashboard/       # Main dashboard / homepage
│   │   │   ├── admin/           # Admin panel
│   │   │   ├── analytics/       # Analytics & reports
│   │   │   ├── assignments/     # Assignment workspace (teacher & student views)
│   │   │   ├── builder/         # Lesson builder studio
│   │   │   ├── library/         # Lesson library & folder management
│   │   │   ├── live/            # Live session panel
│   │   │   ├── parent/          # Parent dashboard
│   │   │   ├── profile/         # User profile
│   │   │   └── responses/       # Student response studio
│   │   ├── api/                 # REST API routes (Route Handlers)
│   │   │   ├── activities/
│   │   │   ├── admin/
│   │   │   ├── analytics/
│   │   │   ├── assessments/
│   │   │   ├── assignment-mcq-attempts/
│   │   │   ├── assignment-mcqs/
│   │   │   ├── auth/
│   │   │   ├── classrooms/
│   │   │   ├── content/
│   │   │   ├── integrations/
│   │   │   ├── lessons/
│   │   │   ├── library-folder-items/
│   │   │   ├── library-folders/
│   │   │   ├── media/
│   │   │   ├── notifications/
│   │   │   ├── reports/
│   │   │   ├── responses/
│   │   │   ├── schools/
│   │   │   ├── sessions/
│   │   │   └── users/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Root entry (renders HomepageV2)
│   │   └── globals.css
│   ├── components/
│   │   ├── app-shell/           # Sidebar, topbar, mobile nav, account menu
│   │   ├── dashboard/           # Homepage, feature grid, lesson builder, library, live session, etc.
│   │   ├── forms/               # Auth form
│   │   ├── marketing/           # Marketing preview component
│   │   └── ui/                  # Reusable primitives: Button, Card, Badge, Input, Modal, Progress, Select, StatCard, EmptyState
│   ├── data/                    # Static/seed data helpers
│   ├── lib/
│   │   ├── env.ts               # Environment variable validation & normalization
│   │   └── platform-data.ts     # Server-side data fetching (getDashboardSnapshot, etc.)
│   ├── types/                   # Shared TypeScript types
│   └── __tests__/               # Unit & integration tests
├── supabase/
│   ├── schema.sql               # Full PostgreSQL schema (tables, indexes, RLS policies)
│   └── seed.sql                 # Development seed data
├── scripts/
│   └── create-engagepost-video.mjs
├── public/                      # Static assets
├── middleware.ts                 # Next.js middleware for auth-protected routes
├── next.config.ts
├── tailwind.config (via postcss)
├── vitest.config.ts
├── tsconfig.json
└── .env                         # Local environment variables (not committed)
```

---

## Database Schema

The Supabase PostgreSQL database contains the following core tables:

| Table | Description |
|---|---|
| `schools` | School records with district, plan tier (freemium / district / enterprise), and timezone |
| `users` | Platform users linked to Supabase Auth; roles: `teacher`, `student`, `parent`, `admin`, `instructional_coach` |
| `classrooms` | Teacher-owned classrooms with subject, grade band, pace mode, and roster/completion stats |
| `lessons` | Lessons with subject, grade band, status (`draft` / `published` / `live`), AI-assist flag, and standards tags |
| `activities` | Individual activities within a lesson; types: `quiz`, `poll`, `draw`, `open_ended`, `collaboration`, `video`, `field_trip` |
| `sessions` | Live instances of a lesson inside a classroom; tracks attendees, engagement score, and response rate |
| `responses` | Student responses to activities within a session |
| `assignments` | Links lessons to classrooms with a due date |
| `assignment_mcqs` | MCQ questions attached to an assignment |
| `assignment_mcq_attempts` | Student attempts at assignment MCQs |
| `library_folders` | Folder hierarchy for organizing lessons in the library |
| `library_folder_items` | Lesson-to-folder membership |
| `notifications` | In-app notifications per user |

---

## User Roles

| Role | Access |
|---|---|
| `teacher` | Create/publish lessons, launch live sessions, manage classrooms, assign work, view analytics |
| `student` | Complete assignments, respond in live sessions, view personal streaks and progress |
| `parent` | View child's assignments, sessions, and engagement streaks |
| `admin` | Full school/district management, user admin, library oversight |
| `instructional_coach` | Cross-classroom analytics and reporting |

---

## Pages & Routes

| Path | Description |
|---|---|
| `/` | Root — renders the main dashboard homepage |
| `/login` | Email/password login |
| `/register` | New account registration |
| `/dashboard` | Dashboard overview with snapshot stats |
| `/builder` | Lesson builder studio |
| `/library` | Lesson library with folder management |
| `/live` | Live session panel for teachers |
| `/assignments` | Assignment workspace (adapts per role) |
| `/responses` | Student response studio |
| `/analytics` | Engagement analytics and reports |
| `/admin` | Admin panel |
| `/parent` | Parent monitoring dashboard |
| `/profile` | User profile settings |

All routes under `/(dashboard)` are protected by `middleware.ts`, which redirects unauthenticated users to `/login`.

---

## Environment Variables

Create a `.env` file at the project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL (exposed to the browser).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — The public anonymous key for client-side Supabase calls.
- `SUPABASE_SERVICE_ROLE_KEY` — The secret service role key used only in server-side API routes. **Never expose this to the client.**

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with the schema applied

### 1. Clone the repository

```bash
git clone <repository-url>
cd engagepod
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example and fill in your Supabase credentials:

```bash
cp .env.example .env
```

### 4. Apply the database schema

Run the schema and seed files against your Supabase project via the Supabase Dashboard SQL editor or the CLI:

```bash
# Using Supabase CLI
supabase db reset
# or manually run:
supabase/schema.sql
supabase/seed.sql
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Tests

EngagePod uses [Vitest](https://vitest.dev) with `@testing-library/react` and `jsdom`.

```bash
# Run all tests once with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

Coverage reports are output to the `coverage/` directory.

Additional scripts:

```bash
# Type-check without emitting
npm run typecheck

# Lint the codebase
npm run lint
```

---

## Deployment

The recommended deployment target is [Vercel](https://vercel.com).

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Add the three environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) under **Settings → Environment Variables**.
4. Deploy — Vercel will auto-detect Next.js and run `next build`.

For self-hosted deployments, build and start the production server:

```bash
npm run build
npm start
```

---

## Contributing

Pull requests and issue reports are welcome. Please open an issue first to discuss significant changes.

## License

Private — all rights reserved.
