<div align="center">

# WEAVE

**Visual Workflow Automation for Intelligent Systems**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![tRPC](https://img.shields.io/badge/tRPC-11-398CCB?logo=trpc&logoColor=white)](https://trpc.io/)
[![Inngest](https://img.shields.io/badge/Inngest-3-7C3AED)](https://inngest.com/)

</div>

---

## Table of Contents

- [What is Weave?](#what-is-weave)
- [How It Actually Works](#how-it-actually-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [Step 1 — Clone](#step-1--clone)
  - [Step 2 — Install Dependencies](#step-2--install-dependencies)
  - [Step 3 — Environment Variables](#step-3--environment-variables)
  - [Step 4 — Database Setup](#step-4--database-setup)
  - [Step 5 — Run the Dev Server](#step-5--run-the-dev-server)
  - [Step 6 — Run the Inngest Dev Server](#step-6--run-the-inngest-dev-server)
  - [Step 7 — Webhook Tunneling with ngrok](#step-7--webhook-tunneling-with-ngrok-optional)
- [Available Scripts](#available-scripts)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Node Reference](#node-reference)
- [Database Schema](#database-schema)
- [API Layer](#api-layer)
- [Plans and Limits](#plans-and-limits)
- [Environment Variable Reference](#environment-variable-reference)
- [Contributing](#contributing)

---

## What is Weave?

Weave is a full-stack visual workflow automation platform. The pitch is simple: instead of writing a pile of glue code every time you want two services to talk to each other, you open a canvas, drop some nodes on it, draw arrows between them, and press run. Weave handles the graph traversal, background execution, retries, branching logic, and execution history.

Think n8n or Zapier — except you built this one from scratch with a proper tech stack, which is infinitely better for your resume and your understanding of how these systems actually work under the hood.

It is a real production-grade application. The execution engine uses a topological sort to determine the correct order of node execution. There is a proper branching engine for Condition nodes. Scheduled workflows use Inngest's durable `step.sleepUntil` inside an infinite loop that survives server restarts. Credentials are encrypted at rest with AES. The API enforces plan limits at the tRPC middleware level. None of this is fake.

---

## How It Actually Works

Understanding this before diving into code will save you a lot of time.

**The Execution Engine**

When you trigger a workflow, the app sends an event called `workflows/execute.workflow` to Inngest. Inngest picks this up and runs the `executeWorkflow` function in `src/inngest/functions.ts`. Here is what happens inside that function, step by step:

1. A new `Execution` record is created in the database with status `RUNNING`.
2. The workflow is loaded from Postgres — all nodes and connections.
3. The nodes are sorted into execution order using a topological sort (via the `toposort` package). This is what ensures a node never runs before its inputs are ready.
4. The runner walks the sorted graph, node by node. For each node, it calls the corresponding executor from the `executorRegistry` — a simple map of `NodeType -> executor function`.
5. Each executor receives a `context` object containing the accumulated outputs from all previous nodes, and returns a new context with its own output merged in. This is how data flows between nodes — every node can reference the output of any upstream node via template variables like `{{myGemini.text}}`.
6. When a `CONDITION` node runs, it returns a special `__branch` field (`"true"` or `"false"`). The runner reads this and follows the matching connection's `fromOutput` handle instead of the default path.
7. There is a safety guard: if a workflow somehow exceeds 100 steps, it throws a `NonRetriableError` to prevent infinite loops.
8. Once all nodes have run, the `Execution` record is updated to `SUCCESS` with the final context as output. If anything throws, the Inngest `onFailure` handler catches it and marks the execution as `FAILED`.

**The Schedule Runner**

The `scheduleRunner` Inngest function (`src/inngest/schedule-runner.ts`) is a separate, long-running function. When started for a workflow, it enters an infinite `while(true)` loop. On each iteration it reads the workflow's cron expression, uses `CronExpressionParser` to calculate the next fire time, calls `step.sleepUntil(nextDate)` — which is a durable sleep that survives restarts — then fires the workflow. This repeats forever until the schedule node is disabled.

**The API**

Everything the frontend does goes through tRPC. There are three routers: `workflows`, `credentials`, and `executions`. There are three tiers of procedure:
- `baseProcedure` — anyone can call it
- `protectedProcedure` — requires a valid session (checked via Better Auth)
- `premiumProcedure` — requires an active Polar.sh subscription (checked against the Polar API)

Plan limits are enforced inside the `workflowsRouter.create` mutation: free users are capped at 5 workflows via a Prisma transaction with a row-count check.

---

## Features

| Feature | Details |
|---|---|
| Visual Editor | Drag-and-drop canvas built on React Flow. Nodes, edges, handles — the full package. Save triggers a tRPC mutation that diffs and rebuilds the graph in a single Postgres transaction. |
| Execution Engine | Topological sort + iterative branching engine running as a durable Inngest function. Handles linear flows, conditional branches, and everything in between. |
| 15 Built-in Nodes | Five trigger types and ten action/logic nodes. See the full node reference below. |
| Credential Vault | Per-user encrypted API key storage. Keys are AES-encrypted via Cryptr before hitting the database. Executors decrypt on the fly at runtime. |
| Real-time Execution Logs | Each node has an Inngest Realtime channel. Status updates are pushed to the client as the workflow runs — you can watch it execute live. |
| Scheduled Triggers | Cron-based scheduling using a durable Inngest long-running function. Set a cron expression on the node, enable it, and it runs forever on schedule. |
| Webhook Triggers | Each workflow gets a unique URL at `/api/webhooks/[workflowId]`. POST anything there and the workflow fires with the request body available as context. |
| Demo Workflows | Two pre-built deployable demo workflows: an AI Summarizer Bot and a Smart Ticket Triage system. Both are created with real nodes and connections via the `deployDemo` mutation. |
| Auth | Email/password and social login (GitHub, Google) via Better Auth. A Polar.sh customer record is created automatically on sign-up. |
| Subscription Billing | Free and Pro plans managed via Polar.sh. Plan checks happen at the tRPC middleware level — not just the UI. |
| Error Monitoring | Sentry on client and server with source maps. The `tunnelRoute` is configured so it works even when users have ad-blockers. |
| Paginated Execution History | Full run history with status, output, error stack traces, and timing. Paginated with search. |

---

## Tech Stack

### Frontend

| Library | Version | Role |
|---|---|---|
| Next.js | 16 | React framework with App Router and Turbopack |
| React | 19 | UI library |
| @xyflow/react (React Flow) | 12 | The workflow canvas — nodes, edges, drag-and-drop |
| Tailwind CSS | v4 | Styling |
| Motion | 12 | Component animations and transitions |
| GSAP + ScrollTrigger | 3 | Scroll-driven animations on the landing page |
| Jotai | 2 | Atomic state management for editor state |
| TanStack Query | 5 | Server state, caching, background refetching |
| tRPC client | 11 | Type-safe API calls from the browser |
| React Hook Form + Zod | 7 + 4 | Forms and schema validation |
| nuqs | 2 | Type-safe URL search params |
| Recharts | 2 | Charts in execution views |
| react-resizable-panels | 3 | Resizable panel layouts in the editor |
| Sonner | 2 | Toast notifications |

### Backend

| Library | Version | Role |
|---|---|---|
| tRPC server | 11 | End-to-end type-safe API layer with three middleware tiers |
| Prisma | 6 | ORM — schema-first, migrations tracked, PostgreSQL adapter |
| Neon (PostgreSQL) | — | Serverless Postgres with connection pooling |
| Inngest | 3 | Durable workflow execution, scheduling, real-time streaming |
| Better Auth | 1 | Auth — sessions, OAuth, email/password, Polar plugin |
| Polar.sh | 0.41 | Subscription billing and customer management |
| Sentry | 10 | Error monitoring with Edge and Node runtime support |
| Cryptr | 6 | Symmetric AES encryption for stored credentials |
| SuperJSON | 2 | tRPC data transformer — handles Dates, Maps, Sets correctly |
| Handlebars | 4 | Template variable resolution in node data (the `{{var.field}}` syntax) |
| cron-parser | 5 | Parses cron expressions for the schedule trigger |
| toposort | 2 | Topological sort for workflow graph traversal |

### Developer Tooling

| Tool | Role |
|---|---|
| Biome | Unified linter + formatter. Replaces ESLint and Prettier. |
| TypeScript 5 (strict) | Strict mode enabled. If it compiles, it is probably correct. |
| dotenv-cli | Injects `.env` into npm scripts (used by `ngrok:dev`) |
| ngrok | Public tunnel for local webhook testing |

---

## Getting Started Locally

Follow the steps below in order. Skipping ahead because "it's probably fine" is how you end up spending 45 minutes debugging an `ENCRYPTION_KEY` error at 11pm.

### Prerequisites

**Tools you need installed:**

| Tool | Minimum Version | Download |
|---|---|---|
| Node.js | 20 | [nodejs.org](https://nodejs.org/) |
| npm | 10 | Bundled with Node.js |
| Git | Any | [git-scm.com](https://git-scm.com/) |

**External service accounts you will need:**

| Service | Purpose | Required? | Link |
|---|---|---|---|
| Neon | Serverless PostgreSQL database | Yes | [neon.tech](https://neon.tech/) |
| Inngest | Workflow execution and local dev server | Yes | [inngest.com](https://inngest.com/) |
| GitHub (OAuth App) | GitHub social login | Yes | [github.com/settings/developers](https://github.com/settings/developers) |
| Google Cloud | Google social login | No | [console.cloud.google.com](https://console.cloud.google.com/) |
| Polar.sh | Billing — sandbox environment | No | [sandbox.polar.sh](https://sandbox.polar.sh/) |
| Sentry | Error tracking | No | [sentry.io](https://sentry.io/) |
| ngrok | Webhook tunneling for local dev | No | [ngrok.com](https://ngrok.com/) |

All of these have free tiers. You will not be asked for a credit card to get started.

---

### Step 1 — Clone

```bash
git clone https://github.com/himanshuhe981/Weave.git
cd Weave
```

---

### Step 2 — Install Dependencies

```bash
npm install
```

After packages are installed, a `postinstall` script automatically runs `prisma generate` to produce the typed Prisma client from `prisma/schema.prisma`. You will see Prisma output in the terminal — that is normal.

---

### Step 3 — Environment Variables

Create a `.env` file in the project root. Copy the annotated template below and fill in your values.

```bash
# ─────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────

# Grab this from your Neon project dashboard under "Connection string".
# It must have ?sslmode=require at the end — Neon requires SSL.
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"


# ─────────────────────────────────────────────────
# BETTER AUTH
# ─────────────────────────────────────────────────

# Random secret used to sign session tokens. Generate a good one:
#   openssl rand -hex 32
BETTER_AUTH_SECRET="your-random-secret-here"

# The URL of your running app. Leave as localhost for local dev.
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth App credentials.
# Create an app at: https://github.com/settings/developers
#   Homepage URL:      http://localhost:3000
#   Callback URL:      http://localhost:3000/api/auth/callback/github
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth credentials (optional — skip if you don't need Google login).
# Create at: https://console.cloud.google.com -> APIs & Services -> Credentials
#   Authorized redirect URI: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"


# ─────────────────────────────────────────────────
# AI MODEL KEYS
# ─────────────────────────────────────────────────

# Only needed if you want to run AI nodes in your workflows.
# Leave blank otherwise — the app won't crash, the AI nodes just won't work.
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
OPENAI_AI_KEY="your-openai-api-key"


# ─────────────────────────────────────────────────
# ENCRYPTION
# ─────────────────────────────────────────────────

# The key used to encrypt API keys stored in the credential vault.
# Must be exactly 32 hex characters. Generate one:
#   openssl rand -hex 16
# WARNING: Losing this key means losing access to all stored credentials.
ENCRYPTION_KEY="your-32-character-hex-key"


# ─────────────────────────────────────────────────
# WEBHOOKS
# ─────────────────────────────────────────────────

# A secret passed in the Authorization header when validating webhook payloads.
# Generate with: openssl rand -hex 32
WEBHOOK_SECRET="your-webhook-secret"


# ─────────────────────────────────────────────────
# POLAR — Subscriptions (optional)
# ─────────────────────────────────────────────────

# Skip these entirely if you are not working on billing.
# The app will treat all users as free-tier if Polar is not configured.
POLAR_ACCESS_TOKEN="your-polar-access-token"
POLAR_SUCCESS_URL="http://localhost:3000"
# Use "sandbox" locally. Switch to "production" only when you deploy to production.
POLAR_SERVER="sandbox"


# ─────────────────────────────────────────────────
# SENTRY (optional)
# ─────────────────────────────────────────────────

# Only needed if you are testing Sentry error capture. Safe to leave blank.
SENTRY_AUTH_TOKEN="your-sentry-auth-token"


# ─────────────────────────────────────────────────
# MISCELLANEOUS
# ─────────────────────────────────────────────────

# Public-facing app URL. The NEXT_PUBLIC_ prefix means the browser can read it.
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Your ngrok static domain — only needed for local webhook testing (Step 7).
NGROK_URL="your-subdomain.ngrok-free.dev"
```

> **Do not commit `.env` to Git.** It is already in `.gitignore`. This warning exists because one day you will forget, and it will be bad.

---

### Step 4 — Database Setup

Push the Prisma schema to your database. This creates all the tables:

```bash
npx prisma migrate deploy
```

If you are running this for the first time and there is no migration history, use `migrate dev` instead — it creates the migration files as well:

```bash
npx prisma migrate dev
```

To visually browse and edit your database at any point, open Prisma Studio:

```bash
npx prisma studio
```

It opens a local web UI on port 5555. Genuinely useful for debugging why a workflow isn't showing up or why a node's data looks wrong.

---

### Step 5 — Run the Dev Server

```bash
npm run dev
```

Next.js starts with Turbopack. The initial compile is fast. Open [http://localhost:3000](http://localhost:3000).

If you land on an error page instead of the landing page, check your `.env`. Specifically check `DATABASE_URL` (wrong connection string is the most common culprit) and `ENCRYPTION_KEY` (the app will crash on startup if this is malformed or missing).

---

### Step 6 — Run the Inngest Dev Server

This is the step most people forget. Without Inngest running, clicking "Execute" on a workflow will appear to do nothing. Events are sent but no function picks them up.

Open a **second terminal** alongside your Next.js dev server:

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

This registers the two Inngest functions (`executeWorkflow` and `scheduleRunner`) with the local dev server, which runs at [http://localhost:8288](http://localhost:8288).

The Inngest Dev Server UI at that URL is where you can:
- Watch functions execute in real time
- Inspect the full event payload for any invocation
- Replay failed function runs without re-triggering the original event
- See the step-level breakdown of a multi-step function

Keep both terminals running. They need each other.

---

### Step 7 — Webhook Tunneling with ngrok *(Optional)*

If you want to test **webhook-triggered workflows** — where an external service (Stripe, Google Forms, or any HTTP client) sends a POST to your app and fires a workflow — your local server needs a public URL. That is ngrok's job.

1. Install [ngrok](https://ngrok.com/) and authenticate your account.
2. Set `NGROK_URL` in your `.env` to your static ngrok domain (available in your ngrok dashboard).
3. In a third terminal:

```bash
npm run ngrok:dev
```

Your app is now reachable at `https://your-subdomain.ngrok-free.dev`. Webhook endpoints are at:

```
https://your-subdomain.ngrok-free.dev/api/webhooks/[workflowId]
```

Copy the workflowId from the editor URL, paste it into the webhook URL, and you are set. Any service that can send a POST request can now trigger your local workflow.

---

## Available Scripts

| Script | Command | When to use it |
|---|---|---|
| Development | `npm run dev` | All day, every day. Turbopack + hot reload. |
| Build | `npm run build` | Before deploying. Also useful to catch type errors that only surface at build time. |
| Start | `npm start` | Runs the compiled production build. Requires `npm run build` first. |
| Lint | `npm run lint` | Before committing. Biome checks formatting and code quality simultaneously. |
| Format | `npm run format` | Auto-fixes formatting issues in place. Run this if lint is yelling about whitespace. |
| Webhook Tunnel | `npm run ngrok:dev` | When testing webhook-triggered workflows locally. |

---

## Architecture Overview

This is the big picture of how the different parts connect:

```
Browser
  |
  +-- tRPC client (src/trpc/client.tsx)
  |     |
  |     +-- HTTP POST /api/trpc/*
  |           |
  |           +-- tRPC server (src/trpc/init.ts)
  |                 |
  |                 +-- baseProcedure        (public)
  |                 +-- protectedProcedure   (requires Better Auth session)
  |                 +-- premiumProcedure     (requires active Polar subscription)
  |                 |
  |                 +-- workflowsRouter      (CRUD, execute, demos)
  |                 +-- credentialsRouter    (encrypted key management)
  |                 +-- executionsRouter     (run history and logs)
  |
  +-- Better Auth client (src/lib/auth-client.ts)
        |
        +-- HTTP /api/auth/*  (login, logout, OAuth callbacks)

Workflow Execution
  |
  +-- tRPC mutation: workflows.execute
  |     |
  |     +-- inngest.send("workflows/execute.workflow")
  |           |
  |           +-- Inngest Dev Server / Cloud
  |                 |
  |                 +-- executeWorkflow function (src/inngest/functions.ts)
  |                       |
  |                       +-- topologicalSort(nodes, connections)
  |                       +-- while(currentNode) {
  |                       |     executor = executorRegistry[node.type]
  |                       |     context = await executor({data, context, step, publish})
  |                       |     -- CONDITION: follow __branch handle
  |                       |     -- DEFAULT:   follow next connection
  |                       |   }
  |                       +-- update Execution: SUCCESS / FAILED
  |
  +-- Inngest Realtime channels (one per node type)
        |
        +-- publish() called from each executor
        +-- browser subscribes via @inngest/realtime
        +-- live status updates without polling

Schedule Trigger
  |
  +-- scheduleRunner (src/inngest/schedule-runner.ts)
        |
        +-- Persistent Inngest function, started when schedule node is enabled
        +-- while(true) {
        |     nextDate = cronParser.parse(cron).next()
        |     await step.sleepUntil(nextDate)        // durable sleep
        |     inngest.send("workflows/execute.workflow")
        |   }
        +-- Stops if schedule node is disabled on next iteration

Webhook Trigger
  |
  +-- External service POSTs to /api/webhooks/[workflowId]
        |
        +-- Validates WEBHOOK_SECRET
        +-- Calls sendWorkflowExecution({ workflowId, initialData: req.body })
        +-- Workflow fires with webhook body available in context
```

---

## Project Structure

```
weave/
|
+-- prisma/
|   +-- schema.prisma              # Source of truth for all database models.
|   +-- migrations/                # SQL migration history. Auto-generated by Prisma.
|
+-- public/                        # Static assets served at the root URL.
|
+-- src/
|   |
|   +-- app/                       # Next.js App Router. Folder = route.
|   |   |
|   |   +-- (auth)/                # Route group: no sidebar, minimal layout.
|   |   |   +-- login/             # /login
|   |   |   +-- signup/            # /signup
|   |   |
|   |   +-- (dashboard)/           # Route group: authenticated, sidebar layout.
|   |   |   +-- (rest)/            # Standard dashboard pages.
|   |   |   |   +-- workflows/     # /workflows — workflow list with search + pagination
|   |   |   |   +-- executions/    # /executions — full execution history
|   |   |   |   +-- credentials/   # /credentials — encrypted API key vault
|   |   |   |
|   |   |   +-- (editor)/          # Full-screen canvas layout. No sidebar.
|   |   |       +-- workflows/     # /workflows/[id] — the visual workflow editor
|   |   |
|   |   +-- api/
|   |   |   +-- auth/              # Better Auth catches all /api/auth/* here.
|   |   |   +-- inngest/           # Inngest function registration endpoint.
|   |   |   +-- trpc/              # tRPC HTTP handler.
|   |   |   +-- webhooks/
|   |   |   |   +-- [workflowId]/  # Unique per-workflow webhook endpoint.
|   |   |   |   +-- google-form/   # Google Form submission handler.
|   |   |   |   +-- stripe/        # Stripe event handler.
|   |   |   +-- schedule/          # Called to start/stop schedule runners.
|   |   |
|   |   +-- docs/                  # Documentation page.
|   |   +-- payment-success/       # Post-Polar checkout landing page.
|   |   +-- layout.tsx             # Root layout: fonts, providers, Sentry init.
|   |   +-- page.tsx               # Landing / marketing page.
|   |   +-- globals.css            # Global styles + Tailwind base layer.
|   |
|   +-- components/
|   |   +-- ui/                    # shadcn/ui base components.
|   |   +-- landing_page/          # Every section, animation, and element on the marketing page.
|   |   +-- react-flow/            # Custom React Flow node/edge renderers.
|   |   +-- app-sidebar.tsx        # Main navigation sidebar.
|   |   +-- app-header.tsx         # Top bar.
|   |   +-- node-dialog.tsx        # Modal for configuring node settings.
|   |   +-- node-selector.tsx      # Node picker panel in the editor.
|   |   +-- workflow-node.tsx      # Individual node card on the canvas.
|   |   +-- upgrade-modal.tsx      # Paywall modal shown when free limits are hit.
|   |
|   +-- features/                  # Domain-level code, organized by feature.
|   |   |
|   |   +-- workflows/
|   |   |   +-- server/
|   |   |   |   +-- routers.ts     # The workflows tRPC router.
|   |   |   |                      # Contains: create, remove, update, getOne, getMany,
|   |   |   |                      #           execute, deployDemo, attachDemoCredentials.
|   |   |   +-- components/        # Workflow list cards, create button, etc.
|   |   |   +-- hooks/             # Client hooks for workflow data.
|   |   |
|   |   +-- executions/
|   |   |   +-- lib/
|   |   |   |   +-- executor-registry.ts   # Maps NodeType -> executor function.
|   |   |   |                              # This is where new node types get registered.
|   |   |   +-- components/               # One folder per node type, each containing:
|   |   |   |   +-- [node-type]/          #   node.tsx     — React Flow canvas component
|   |   |   |   |   +-- node.tsx          #   executor.ts  — server-side execution logic
|   |   |   |   |   +-- executor.ts       #   dialog.tsx   — configuration form
|   |   |   +-- server/
|   |   |       +-- routers.ts            # Executions tRPC router (list, get, pagination).
|   |   |
|   |   +-- triggers/
|   |   |   +-- components/               # Same structure as executions/components.
|   |   |       +-- [trigger-type]/       # node.tsx + executor.ts per trigger.
|   |   |
|   |   +-- credentials/
|   |   |   +-- server/
|   |   |       +-- routers.ts            # Credentials tRPC router (create, delete, list).
|   |   |                                 # Encrypts via lib/encryption.ts before saving.
|   |   +-- auth/                         # Auth utilities, session access helpers.
|   |   +-- editor/                       # Canvas state, save logic, node panel interactions.
|   |   +-- subscriptions/                # Plan check utilities (reads Polar customer state).
|   |
|   +-- inngest/
|   |   +-- client.ts              # Inngest client singleton.
|   |   +-- functions.ts           # executeWorkflow — the core execution engine.
|   |   +-- schedule-runner.ts     # scheduleRunner — long-running schedule loop.
|   |   +-- channels/              # One Inngest Realtime channel definition per node type.
|   |   |   +-- [node-type].ts     # e.g., gemini.ts, discord.ts, condition.ts
|   |   +-- utils.ts               # topologicalSort() and sendWorkflowExecution().
|   |
|   +-- trpc/
|   |   +-- routers/
|   |   |   +-- _app.ts            # Root router. Merges workflows, credentials, executions.
|   |   +-- init.ts                # Context, baseProcedure, protectedProcedure, premiumProcedure.
|   |   +-- server.tsx             # Server-side tRPC caller (for Server Components).
|   |   +-- client.tsx             # Client-side tRPC provider + hooks.
|   |   +-- query-client.ts        # TanStack Query config shared between server and client.
|   |
|   +-- lib/
|   |   +-- auth.ts                # Better Auth config: GitHub, Google, email/password, Polar plugin.
|   |   +-- auth-client.ts         # Better Auth browser client.
|   |   +-- auth-utils.ts          # getCurrentUser() and similar server-side helpers.
|   |   +-- db.ts                  # Prisma client singleton. Import from here, not from @prisma/client.
|   |   +-- encryption.ts          # encrypt() and decrypt() wrappers around Cryptr.
|   |   +-- checkout.ts            # Polar checkout session helpers.
|   |   +-- polar.ts               # Polar client singleton.
|   |   +-- utils.ts               # cn() for class merging and other small utilities.
|   |
|   +-- config/
|   |   +-- constants.ts           # PAGINATION config and other app-wide constants.
|   |   +-- node-components.ts     # Registry: NodeType enum -> React component.
|   |                              # This is what React Flow uses to render the canvas.
|   +-- hooks/                     # Shared custom React hooks.
|   +-- generated/                 # Auto-generated output. Do not touch manually.
|   +-- instrumentation.ts         # Sentry server/edge initialization (Next.js hook).
|   +-- instrumentation-client.ts  # Sentry browser initialization.
|
+-- .env                           # Your secrets. Do not commit this.
+-- .gitignore
+-- biome.json                     # Biome linter + formatter config.
+-- components.json                # shadcn/ui config (component paths, style, etc.)
+-- next.config.ts                 # Next.js config, wrapped with Sentry plugin.
+-- postcss.config.mjs             # PostCSS for Tailwind v4.
+-- tsconfig.json                  # TypeScript config. Strict mode is on.
+-- package.json
```

---

## Node Reference

Every workflow starts with one trigger node. Everything after that is an action or logic node. Data flows between nodes via a shared `context` object. Each node writes its output into the context under a `variableName` key, and downstream nodes can reference it with `{{variableName.field}}`.

### Trigger Nodes

| Node | Type Enum | What triggers it |
|---|---|---|
| Manual Trigger | `MANUAL_TRIGGER` | Clicking "Execute" in the dashboard or editor. |
| Webhook Trigger | `WEBHOOK_TRIGGER` | An HTTP POST to `/api/webhooks/[workflowId]`. The request body lands in context as `webhook.body`. |
| Google Form Trigger | `GOOGLE_FORM_TRIGGER` | A new submission sent to `/api/webhooks/google-form`. |
| Stripe Trigger | `STRIPE_TRIGGER` | A Stripe webhook event sent to `/api/webhooks/stripe`. |
| Schedule Trigger | `SCHEDULE_TRIGGER` | A cron expression fires. Uses `cron-parser` to calculate next run time. Requires enabling and setting a cron expression in the node config. |

### Action Nodes

| Node | Type Enum | What it does |
|---|---|---|
| HTTP Request | `HTTP_REQUEST` | Makes an HTTP GET, POST, PUT, or DELETE to any URL. Response body is written to context. |
| OpenAI | `OPENAI` | Sends a prompt to an OpenAI model. Response text written to `context[variableName].text`. |
| Anthropic | `ANTHROPIC` | Same as OpenAI but using the Claude API. |
| Gemini | `GEMINI` | Same but using Google Gemini. Default model is `gemini-2.5-flash-lite`. |
| Discord | `DISCORD` | Sends a message to a Discord channel via a webhook URL stored in the credential vault. |
| Slack | `SLACK` | Sends a message to a Slack channel via a webhook URL. |
| Telegram | `TELEGRAM` | Sends a message via a Telegram bot token. |

### Logic and Utility Nodes

| Node | Type Enum | What it does |
|---|---|---|
| Condition | `CONDITION` | Evaluates one or more rules (left / operator / right) against the current context. Outputs `true` or `false` on named handles. The execution engine reads the `__branch` field to route to the correct next node. Supports AND and OR combinators. |
| JSON Transform | `JSON_TRANSFORM` | Reshapes the context data using a mapping configuration. Useful when one node outputs a format that does not match what the next node expects. |
| Delay | `DELAY` | Pauses execution for a specified duration. Implemented via Inngest's `step.sleep()`, so the delay is durable and does not block a thread. |

---

## Database Schema

The full schema is in `prisma/schema.prisma`. Here is a readable summary of the relationships and what each model represents:

```
User
  id, name, email, image, emailVerified
  |
  +-- has many --> Session       (Better Auth sessions — one per active login)
  +-- has many --> Account       (OAuth accounts — one per linked provider)
  +-- has many --> Credential    (user's stored API keys, AES-encrypted)
  +-- has many --> Workflow

Workflow
  id, name, userId, createdAt, updatedAt
  |
  +-- has many --> Node          (canvas elements — each has type, position, data JSON)
  +-- has many --> Connection    (edges between nodes — fromNodeId + fromOutput -> toNodeId + toInput)
  +-- has many --> Execution     (one record per run)

Node
  id, workflowId, name, type (NodeType enum), position (JSON), data (JSON)
  |
  +-- optionally belongs to --> Credential   (e.g., a Gemini node references a stored API key)
  +-- has many --> Connection (as source)    (connections going OUT from this node)
  +-- has many --> Connection (as target)    (connections coming INTO this node)

Connection
  id, workflowId
  fromNodeId + fromOutput  -->  toNodeId + toInput
  (fromOutput and toInput are handle names — "main" by default, "true"/"false" for Condition)
  Unique constraint: (fromNodeId, toNodeId, fromOutput, toInput)

Execution
  id, workflowId, status (RUNNING | SUCCESS | FAILED)
  startedAt, completedAt, output (JSON), error (Text), errorStack (Text)
  inngestEventId (unique — used to look up this run in the Inngest dashboard)

Credential
  id, name, type (CredentialType enum), value (encrypted string), userId
  CredentialType: OPENAI | ANTHROPIC | GEMINI | TELEGRAM | DISCORD | SLACK
```

---

## API Layer

Weave uses tRPC for all client-server communication. Here is a summary of every available procedure:

**`workflows` router**

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `workflows.create` | mutation | protected | Creates a new workflow with an initial node. Enforces 5-workflow limit for free users via a Prisma transaction. |
| `workflows.remove` | mutation | protected | Deletes a workflow and cascades to all nodes, connections, and executions. |
| `workflows.update` | mutation | protected | Saves the canvas state — rebuilds all nodes and connections in a single transaction (timeout: 20s). |
| `workflows.updateName` | mutation | protected | Renames a workflow. Blocks names starting with `__demo__`. |
| `workflows.getOne` | query | protected | Fetches a workflow with nodes and connections, transformed into React Flow format. |
| `workflows.getMany` | query | protected | Paginated list with search. Excludes `__demo__` prefixed workflows from results. |
| `workflows.execute` | mutation | protected | Sends `workflows/execute.workflow` event to Inngest. |
| `workflows.getUsage` | query | protected | Returns current workflow count and the limit (5 for free users). |
| `workflows.deployDemo` | mutation | protected | Creates a pre-built demo workflow (`summarizer` or `triage`) with all nodes and connections wired up. Idempotent. |
| `workflows.attachDemoCredentials` | mutation | protected | Encrypts and attaches provided API keys to the correct nodes in a demo workflow. |

**`credentials` router**

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `credentials.create` | mutation | protected | Encrypts the credential value and stores it. |
| `credentials.remove` | mutation | protected | Deletes a credential. |
| `credentials.getMany` | query | protected | Lists all credentials for the current user (values not returned — only metadata). |

**`executions` router**

| Procedure | Type | Auth | Description |
|---|---|---|---|
| `executions.getMany` | query | protected | Paginated execution history with optional workflowId filter. |
| `executions.getOne` | query | protected | Single execution with full output, error, and timing. |

---

## Plans and Limits

Weave ships with two tiers. The limits are enforced on the server — not just in the UI.

| Limit | Free | Pro |
|---|---|---|
| Workflows | 5 | Unlimited |
| Executions | Unlimited | Unlimited |
| Credentials | Unlimited | Unlimited |
| AI Nodes | Available (bring your own key) | Available |
| Schedule Triggers | Available | Available |

Plan status is checked via Polar.sh. The `checkUserPremium` helper in the workflows router calls `polarClient.customers.getStateExternal({ externalId: userId })` and checks for active subscriptions. If Polar is not configured (no `POLAR_ACCESS_TOKEN`), all premium checks will fall through and treat users as free-tier.

---

## Environment Variable Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string from Neon (or any Postgres provider) |
| `BETTER_AUTH_SECRET` | Yes | Random secret for signing session tokens — generate with `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Yes | Base URL of the app (e.g. `http://localhost:3000`) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App client secret |
| `ENCRYPTION_KEY` | Yes | 32-char hex key for encrypting stored credentials — generate with `openssl rand -hex 16` |
| `WEBHOOK_SECRET` | Yes | Secret for validating incoming webhook requests |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL — `NEXT_PUBLIC_` prefix exposes it to the browser |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Google Gemini API key (for the platform-level Gemini node executor) |
| `ANTHROPIC_API_KEY` | No | Anthropic Claude API key |
| `OPENAI_AI_KEY` | No | OpenAI API key |
| `POLAR_ACCESS_TOKEN` | No | Polar.sh API token for subscription checks and checkout sessions |
| `POLAR_SUCCESS_URL` | No | Redirect URL after successful Polar checkout |
| `POLAR_SERVER` | No | `sandbox` for local/staging, `production` for live |
| `SENTRY_AUTH_TOKEN` | No | Sentry token for source map uploads at build time |
| `NGROK_URL` | No | ngrok static domain for webhook tunneling during local dev |

---

## Contributing

The codebase is structured so that adding a new node type follows a predictable pattern. Here is the general process to give you an idea of how things fit together:

1. Add the new type to the `NodeType` enum in `prisma/schema.prisma` and run `npx prisma migrate dev`.
2. Create a new folder under `src/features/executions/components/[your-node]/` with:
   - `node.tsx` — the React Flow canvas card
   - `executor.ts` — the server-side execution function (matches the `NodeExecutor` type)
   - `dialog.tsx` — the configuration form that opens in the node settings modal
3. Register the executor in `src/features/executions/lib/executor-registry.ts`.
4. Register the React component in `src/config/node-components.ts`.
5. Add an Inngest Realtime channel in `src/inngest/channels/[your-node].ts` and register it in `src/inngest/functions.ts`.

**For other contributions:**

1. Fork the repository.
2. Create a descriptive branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Make your changes and run Biome before committing:
   ```bash
   npm run lint
   ```
4. Commit with a clear message:
   ```bash
   git commit -m "feat: describe what you added and why"
   ```
5. Push and open a Pull Request against `main`.

---

<div align="center">

Built with Next.js, Prisma, Inngest, tRPC, and too much coffee.

(c) 2026 Weave. All rights reserved.

</div>
