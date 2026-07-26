<div align="center">

# WEAVE

**Visual Workflow Automation for Intelligent Systems**

You drag nodes. You connect them. Weave does the rest.  
No code required. Seriously.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![tRPC](https://img.shields.io/badge/tRPC-11-398CCB?logo=trpc&logoColor=white)](https://trpc.io/)

</div>

---

## Table of Contents

- [What is Weave?](#what-is-weave)
- [What Can You Actually Do With It?](#what-can-you-actually-do-with-it)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [Step 1 — Clone the Repository](#step-1--clone-the-repository)
  - [Step 2 — Install Dependencies](#step-2--install-dependencies)
  - [Step 3 — Configure Environment Variables](#step-3--configure-environment-variables)
  - [Step 4 — Set Up the Database](#step-4--set-up-the-database)
  - [Step 5 — Start the Development Server](#step-5--start-the-development-server)
  - [Step 6 — Start the Inngest Dev Server](#step-6--start-the-inngest-dev-server)
  - [Step 7 — Set Up Webhooks with ngrok](#step-7--set-up-webhooks-with-ngrok-optional)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Node Types](#node-types)
- [Database Schema Overview](#database-schema-overview)
- [Environment Variables Reference](#environment-variables-reference)
- [Contributing](#contributing)
- [License](#license)

---

## What is Weave?

Weave is a full-stack, AI-powered workflow automation platform built on Next.js. The idea is simple: instead of writing glue code to connect services together, you open a canvas, drop nodes on it, draw arrows between them, and hit run. Weave figures out the execution order, handles the background jobs, retries failures, and keeps logs of everything.

Think of it like n8n or Zapier — except you built it yourself, which is infinitely cooler to put on a resume.

Under the hood it is a proper production-grade application: tRPC for type-safe APIs, Prisma for database access, Inngest for durable workflow execution, Better Auth for authentication, and Polar.sh for billing. The landing page alone has GSAP scroll animations and a custom cursor. No shortcuts were taken.

---

## What Can You Actually Do With It?

Here are some real things you can automate with Weave, so you have something to show off when someone asks "what does it do":

- A webhook fires (say, a form submission or a Stripe payment) and Weave automatically sends a formatted message to Discord or Slack.
- A schedule trigger runs every morning, calls the OpenAI node with a custom prompt, and pipes the response to a Telegram bot.
- A Condition node checks whether a JSON value meets some criteria and routes the workflow down a different path depending on the result.
- A JSON Transform node reshapes messy API response data into something clean before passing it to the next step.
- A Delay node sits in the middle of a workflow and pauses execution for a set amount of time — because sometimes you just need to wait.

---

## Key Features

| Feature | What it means in practice |
|---|---|
| Visual Editor | A full drag-and-drop canvas built on React Flow. You build workflows by connecting boxes. |
| AI Nodes | Call OpenAI, Claude, or Gemini mid-workflow with a custom prompt and use the response as output. |
| 15+ Node Types | Triggers, conditions, delays, transforms, and messaging integrations — all built in. |
| Real-time Execution | Workflows run as durable background jobs via Inngest. They survive server restarts and handle retries automatically. |
| Credential Vault | Store API keys once, encrypted, and reference them in any node. No hardcoding secrets in workflows. |
| Scheduled Triggers | Run workflows on a cron schedule. Set it and forget it. |
| Webhook Triggers | Every workflow gets a unique URL. POST to it and the workflow fires. |
| Execution History | Every run is logged with status, output, timing, and errors. Nothing disappears into a void. |
| Auth | GitHub and Google social login plus email/password, all handled by Better Auth. |
| Subscription Billing | Free and paid plans managed via Polar.sh. Monetization is already wired in. |
| Error Monitoring | Sentry on both the client and server. You will know when something breaks before the user does. |

---

## Tech Stack

This section exists so you know what you are working with before you touch anything.

### Frontend

| Library | Why it is here |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework with App Router. Turbopack makes the dev server fast enough that you will actually enjoy refreshing the page. |
| [React 19](https://react.dev/) | You know what React is. |
| [React Flow](https://reactflow.dev/) | The library powering the entire workflow canvas. Nodes, edges, drag-and-drop — all of it. |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS. The globals.css is doing a lot of heavy lifting alongside it. |
| [Motion](https://motion.dev/) + [GSAP](https://gsap.com/) | Animation libraries. The landing page uses both. GSAP handles scroll-triggered reveals, Motion handles component transitions. |
| [Jotai](https://jotai.org/) | Atomic state management for the editor. Lightweight and not Redux. |
| [TanStack Query](https://tanstack.com/query) | Handles all the server state, caching, and background refetching on the client. |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Forms and runtime schema validation. Every input in this app is validated. |
| [nuqs](https://nuqs.47ng.com/) | Type-safe URL search params. State lives in the URL where it belongs. |

### Backend

| Library | Why it is here |
|---|---|
| [tRPC v11](https://trpc.io/) | End-to-end type safety between your server and client without writing a REST API. If you change a backend function signature, TypeScript yells at you on the frontend immediately. |
| [Prisma v6](https://www.prisma.io/) | The ORM. Schema lives in `prisma/schema.prisma`. Migrations are tracked. No raw SQL unless you really want to. |
| [Neon PostgreSQL](https://neon.tech/) | Serverless Postgres. Free tier is generous enough for development and small deployments. |
| [Inngest](https://www.inngest.com/) | This is the backbone of workflow execution. Each workflow run is an Inngest function call. It handles retries, concurrency, delays, and scheduling automatically. |
| [Better Auth](https://www.better-auth.com/) | Authentication without the pain of rolling your own sessions and OAuth flows. Handles GitHub, Google, and email/password out of the box. |
| [Polar.sh](https://polar.sh/) | Payments and subscription management. Already integrated, already working. The `POLAR_SERVER=sandbox` flag keeps it safe during local development. |
| [Sentry](https://sentry.io/) | Error tracking. Captures exceptions with full stack traces on both the server (Node.js) and the client (browser). |
| [Cryptr](https://github.com/MauriceButler/cryptr) | Used to symmetrically encrypt credentials before they go into the database. Your stored API keys are not plaintext. |

### Developer Tooling

| Tool | Why it is here |
|---|---|
| [Biome](https://biomejs.dev/) | Linter and formatter combined into one fast tool. Replaces both ESLint and Prettier. Run `npm run lint` before you commit anything. |
| [TypeScript 5](https://www.typescriptlang.org/) | Strict mode is on. Embrace it. It saves you from yourself. |
| [dotenv-cli](https://github.com/entropitor/dotenv-cli) | Lets npm scripts inject `.env` variables. Used by the `ngrok:dev` script. |
| [ngrok](https://ngrok.com/) | Tunnels your localhost to a public URL so external services can reach your webhook endpoints during development. |

---

## Getting Started Locally

Follow these steps in order. Skipping steps is how you spend an hour debugging something that was never your fault.

### Prerequisites

You need these installed on your machine before anything else:

| Tool | Minimum Version | Where to get it |
|---|---|---|
| Node.js | 20 | [nodejs.org](https://nodejs.org/) |
| npm | 10 | Comes with Node.js |
| Git | Any | [git-scm.com](https://git-scm.com/) |

You also need accounts on these services. All of them have free tiers and you will not be asked for a credit card for the required ones:

| Service | What it is for | Required? |
|---|---|---|
| [Neon](https://neon.tech/) | Your PostgreSQL database | Yes |
| [Inngest](https://inngest.com/) | Workflow execution and local dev server | Yes |
| [GitHub OAuth App](https://github.com/settings/developers) | GitHub social login | Yes |
| [Google Cloud](https://console.cloud.google.com/) | Google social login | No |
| [Polar.sh](https://sandbox.polar.sh/) | Billing and subscriptions | No |
| [Sentry](https://sentry.io/) | Error monitoring | No |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/himanshuhe981/Weave.git
cd Weave
```

---

### Step 2 — Install Dependencies

```bash
npm install
```

This will take a minute. There are a lot of packages. When it is done, Prisma generates its client automatically via the `postinstall` script — you do not need to do anything extra.

---

### Step 3 — Configure Environment Variables

Create a file named `.env` in the root of the project. Copy the template below and replace the placeholder values with your actual credentials.

Read the comments. They explain what each variable does and where to get the value.

```bash
# ──────────────────────────────────────────────────────────
# DATABASE
# ──────────────────────────────────────────────────────────

# Your PostgreSQL connection string from Neon (or wherever you are hosting Postgres).
# In Neon: go to your project dashboard, click "Connection string", copy it here.
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"


# ──────────────────────────────────────────────────────────
# BETTER AUTH
# ──────────────────────────────────────────────────────────

# A random secret string for signing auth tokens. Do not reuse this anywhere.
# Generate a good one: openssl rand -hex 32
BETTER_AUTH_SECRET="your-random-32-char-secret"

# The base URL of your running app. Leave this as-is for local development.
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth credentials.
# Go to github.com/settings/developers -> New OAuth App.
# Set Homepage URL to http://localhost:3000
# Set callback URL to http://localhost:3000/api/auth/callback/github
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth (optional — skip this if you do not care about Google login right now).
# Create credentials at console.cloud.google.com under APIs & Services -> Credentials.
# Set redirect URI to http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"


# ──────────────────────────────────────────────────────────
# AI MODEL API KEYS
# ──────────────────────────────────────────────────────────

# These are only needed if you want to actually use those AI nodes in a workflow.
# Leave them empty if you are not using them — the app will not break.
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
OPENAI_AI_KEY="your-openai-api-key"


# ──────────────────────────────────────────────────────────
# ENCRYPTION
# ──────────────────────────────────────────────────────────

# A 32-character hex string used to encrypt API keys stored in the credential vault.
# Without this, the app will crash when you try to save a credential.
# Generate one: openssl rand -hex 16
ENCRYPTION_KEY="your-32-char-hex-key"


# ──────────────────────────────────────────────────────────
# WEBHOOKS
# ──────────────────────────────────────────────────────────

# A secret used to verify that incoming webhook requests are legitimate.
# You can generate this the same way as the encryption key.
WEBHOOK_SECRET="your-webhook-secret"


# ──────────────────────────────────────────────────────────
# POLAR — Billing (optional)
# ──────────────────────────────────────────────────────────

# Skip all of this if you are not working on billing features right now.
POLAR_ACCESS_TOKEN="your-polar-access-token"
POLAR_SUCCESS_URL="http://localhost:3000"
# Keep this as "sandbox" during development. Switch to "production" only when you deploy.
POLAR_SERVER="sandbox"


# ──────────────────────────────────────────────────────────
# SENTRY — Error Monitoring (optional)
# ──────────────────────────────────────────────────────────

# Skip this unless you are testing Sentry integration specifically.
SENTRY_AUTH_TOKEN="your-sentry-auth-token"


# ──────────────────────────────────────────────────────────
# OTHER
# ──────────────────────────────────────────────────────────

# The public URL of your app. Used in redirects, emails, and webhook URLs.
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Your ngrok static domain — only needed if you are testing webhook triggers locally.
# See Step 7 for details.
NGROK_URL="your-subdomain.ngrok-free.dev"
```

> **Important:** Do not commit `.env` to Git. It is already in `.gitignore`, so as long as you do not force-add it, you are fine. This is one of those mistakes that is embarrassing to explain to collaborators.

---

### Step 4 — Set Up the Database

Run this command to create all the database tables from the Prisma schema:

```bash
npx prisma migrate deploy
```

If this is your first time and there is no migration history yet, use this instead — it is the development-friendly version that also creates the migration files:

```bash
npx prisma migrate dev
```

At any point, you can open Prisma Studio to browse and edit your database through a nice UI. It is genuinely useful for debugging:

```bash
npx prisma studio
```

---

### Step 5 — Start the Development Server

```bash
npm run dev
```

Turbopack is enabled, so the initial compile is fast. Open [http://localhost:3000](http://localhost:3000) and you should see the landing page. If you see an error instead, double-check your `.env` — nine times out of ten it is a missing or malformed environment variable.

---

### Step 6 — Start the Inngest Dev Server

This step is easy to forget and then wonder why workflow execution is completely broken. Do not skip it.

Open a **second terminal** and run:

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

This registers your workflow functions with Inngest's local dev server, which runs at [http://localhost:8288](http://localhost:8288). That URL is where you can watch functions execute, inspect event payloads, replay failed runs, and generally understand what is happening inside your workflows in real time.

You need both terminals running at the same time: one for Next.js, one for Inngest.

---

### Step 7 — Set Up Webhooks with ngrok *(Optional)*

If you want to test webhook triggers — where an external service POSTs to your app and triggers a workflow — your local server needs to be reachable from the internet. That is what ngrok is for.

1. Install [ngrok](https://ngrok.com/) and log in to your account.
2. Copy your static domain from the ngrok dashboard and put it in `NGROK_URL` in your `.env`.
3. In a third terminal (yes, three terminals — welcome to full-stack development), run:

```bash
npm run ngrok:dev
```

This tunnels `localhost:3000` to `https://your-subdomain.ngrok-free.dev`. Your webhook endpoint will be reachable at `https://your-subdomain.ngrok-free.dev/api/webhooks`.

---

## Available Scripts

| Script | Command | What it does |
|---|---|---|
| Development | `npm run dev` | Starts the dev server with Turbopack. Use this constantly. |
| Build | `npm run build` | Compiles the production bundle. Run this to check for type errors before deploying. |
| Start | `npm start` | Starts the compiled production build. Requires `npm run build` first. |
| Lint | `npm run lint` | Runs Biome across the codebase. Fix what it flags before opening a PR. |
| Format | `npm run format` | Auto-fixes formatting issues. Run this if Biome is complaining about whitespace. |
| Webhook Tunnel | `npm run ngrok:dev` | Opens the ngrok tunnel. Only needed when testing webhook triggers. |

---

## Project Structure

The project follows Next.js App Router conventions with some additional organization for features and business logic. Here is the full map:

```
weave/
|
+-- prisma/
|   +-- schema.prisma              # Every database model lives here. This is the source of truth.
|   +-- migrations/                # Auto-generated SQL. Do not edit these by hand.
|
+-- public/                        # Static files served at the root URL (images, icons).
|
+-- src/
|   |
|   +-- app/                       # Next.js App Router. Every folder here is a route or a route group.
|   |   |
|   |   +-- (auth)/                # Route group for auth pages. Has its own minimal layout — no sidebar.
|   |   |   +-- login/             # /login
|   |   |   +-- signup/            # /signup
|   |   |   +-- layout.tsx         # Bare layout for auth screens
|   |   |
|   |   +-- (dashboard)/           # Route group for authenticated app pages. Has the sidebar layout.
|   |   |   |
|   |   |   +-- (rest)/            # Standard dashboard pages with the sidebar visible.
|   |   |   |   +-- workflows/     # /workflows — the list of all workflows belonging to the user
|   |   |   |   +-- executions/    # /executions — history of every workflow run
|   |   |   |   +-- credentials/   # /credentials — where users manage their stored API keys
|   |   |   |   +-- layout.tsx     # Wraps these pages with the sidebar and header
|   |   |   |
|   |   |   +-- (editor)/          # Full-screen editor layout. No sidebar — the canvas needs all the space.
|   |   |       +-- workflows/     # /workflows/[id] — the actual visual workflow editor
|   |   |
|   |   +-- api/                   # API routes. These are all server-side.
|   |   |   +-- auth/              # Better Auth catches all /api/auth/* requests here
|   |   |   +-- inngest/           # The endpoint Inngest calls to discover and invoke functions
|   |   |   +-- trpc/              # The HTTP handler that serves all tRPC procedures
|   |   |   +-- webhooks/          # Incoming webhook endpoint — external services POST here to trigger workflows
|   |   |   +-- schedule/          # Called by a cron job to fire schedule-triggered workflows
|   |   |
|   |   +-- docs/                  # Documentation page
|   |   +-- payment-success/       # The page users land on after a successful Polar.sh checkout
|   |   +-- layout.tsx             # Root layout — sets up fonts, theme providers, Sentry
|   |   +-- page.tsx               # The landing page. It is long and has a lot of sections.
|   |   +-- globals.css            # Global styles and Tailwind base layer
|   |
|   +-- components/                # React components. If it renders something, it lives here.
|   |   +-- ui/                    # shadcn/ui primitives — Button, Dialog, Input, Select, etc.
|   |   +-- landing_page/          # Every section and animated element on the marketing page
|   |   +-- react-flow/            # Custom node and edge renderers for the React Flow canvas
|   |   +-- app-sidebar.tsx        # The main navigation sidebar
|   |   +-- app-header.tsx         # The top bar inside the dashboard
|   |   +-- node-dialog.tsx        # The modal that opens when you configure a node's settings
|   |   +-- node-selector.tsx      # The panel for picking and adding new nodes to the canvas
|   |   +-- workflow-node.tsx      # The individual node card rendered on the canvas
|   |   +-- upgrade-modal.tsx      # The paywall modal that appears when a free user hits a plan limit
|   |
|   +-- features/                  # Business logic organized by domain. This is where the real work happens.
|   |   +-- auth/                  # Auth helpers, session utilities, and server-side user resolution
|   |   +-- workflows/             # Workflow CRUD operations, graph traversal, and execution orchestration
|   |   +-- editor/                # Editor state and canvas interaction logic
|   |   +-- executions/            # Fetching, displaying, and formatting execution run data
|   |   +-- credentials/           # Saving, retrieving, and decrypting user credentials
|   |   +-- subscriptions/         # Checking a user's current plan and enforcing limits
|   |   +-- triggers/              # Logic for handling different trigger types when they fire
|   |
|   +-- inngest/                   # Everything related to Inngest background jobs.
|   |   +-- client.ts              # The Inngest client instance. Imported wherever you need to send events.
|   |   +-- functions.ts           # The main workflow execution function — this is the core runner.
|   |   +-- schedule-runner.ts     # The function that handles scheduled workflow triggers.
|   |   +-- channels/              # Inngest Realtime channels for pushing live status updates to the UI
|   |   +-- utils.ts               # Helpers for executing individual node types
|   |
|   +-- trpc/                      # The entire tRPC setup.
|   |   +-- routers/
|   |   |   +-- _app.ts            # The root router. All sub-routers are merged here.
|   |   +-- init.ts                # tRPC context creation and base procedure definitions
|   |   +-- server.tsx             # Server-side caller for use in Server Components and route handlers
|   |   +-- client.tsx             # Client-side provider and hooks — wrap this around your pages
|   |   +-- query-client.ts        # TanStack Query client configuration shared between server and client
|   |
|   +-- lib/                       # Singleton instances and shared utilities. Import from here, not elsewhere.
|   |   +-- auth.ts                # Better Auth server config — OAuth providers, session settings, etc.
|   |   +-- auth-client.ts         # The Better Auth client used in browser contexts
|   |   +-- auth-utils.ts          # Helper functions like getCurrentUser() for server components
|   |   +-- db.ts                  # The Prisma client singleton. One instance per server process.
|   |   +-- encryption.ts          # Wraps Cryptr to encrypt and decrypt credential values
|   |   +-- checkout.ts            # Helpers for creating Polar.sh checkout sessions
|   |   +-- polar.ts               # The Polar.sh client instance
|   |   +-- utils.ts               # General utilities — cn() for class merging, etc.
|   |
|   +-- config/                    # App-wide configuration that does not belong anywhere else.
|   |   +-- constants.ts           # Plan limits, feature flags, and other app-level constants
|   |   +-- node-components.ts     # A registry that maps each NodeType to its React component
|   |
|   +-- hooks/                     # Custom React hooks shared across components
|   +-- generated/                 # Auto-generated code. Do not touch this manually.
|   +-- instrumentation.ts         # Next.js instrumentation hook — initializes Sentry on the server
|   +-- instrumentation-client.ts  # Initializes Sentry in the browser
|
+-- .env                           # Your secrets. DO NOT COMMIT THIS FILE.
+-- .gitignore                     # What Git should ignore. Your .env is already in here.
+-- biome.json                     # Biome linter and formatter config
+-- components.json                # shadcn/ui configuration — tells the CLI where to put new components
+-- next.config.ts                 # Next.js config, wrapped with the Sentry plugin
+-- postcss.config.mjs             # PostCSS config for Tailwind CSS v4
+-- tsconfig.json                  # TypeScript options. Strict mode is on.
+-- package.json                   # Dependencies and scripts
```

---

## Node Types

There are 15 built-in node types split into three categories. Every workflow must start with exactly one trigger. The rest is up to you.

### Trigger Nodes — These start the workflow

| Node Type | What triggers it |
|---|---|
| `MANUAL_TRIGGER` | You click run from the dashboard. Good for testing. |
| `WEBHOOK_TRIGGER` | An HTTP POST arrives at the workflow's unique webhook URL. |
| `GOOGLE_FORM_TRIGGER` | A new response is submitted to a connected Google Form. |
| `STRIPE_TRIGGER` | A Stripe event fires (payment succeeded, subscription created, etc.). |
| `SCHEDULE_TRIGGER` | A cron expression matches the current time and the workflow runs automatically. |

### Action Nodes — These do the actual work

| Node Type | What it does |
|---|---|
| `HTTP_REQUEST` | Makes an HTTP GET, POST, PUT, or DELETE call to any URL. Output is the response body. |
| `OPENAI` | Sends a prompt to an OpenAI model. The response becomes the node's output. |
| `ANTHROPIC` | Same as above, but for Claude. |
| `GEMINI` | Same as above, but for Google Gemini. |
| `DISCORD` | Sends a message to a Discord channel via a bot token or webhook URL. |
| `SLACK` | Sends a message to a Slack channel. |
| `TELEGRAM` | Sends a message via a Telegram bot. |

### Logic and Utility Nodes — These control the flow

| Node Type | What it does |
|---|---|
| `CONDITION` | Evaluates an expression. Routes execution down one of two branches based on the result. |
| `JSON_TRANSFORM` | Takes the incoming data and reshapes it into a new structure. Useful between nodes that speak different formats. |
| `DELAY` | Pauses the workflow for a specified duration before the next node runs. |

---

## Database Schema Overview

Here is how the data is structured. Understanding this makes the codebase considerably less confusing.

```
User
 |-- has many --> Workflow
 |-- has many --> Session        (created and managed by Better Auth on login)
 |-- has many --> Account        (one entry per OAuth provider linked to the account)
 +-- has many --> Credential     (encrypted API keys that belong to this user)

Workflow
 |-- has many --> Node           (each box on the canvas is a node)
 |-- has many --> Connection     (each arrow between nodes is a connection)
 +-- has many --> Execution      (one entry per run, with status and output)

Node
 |-- belongs to     --> Workflow
 |-- optionally     --> Credential    (e.g., an OpenAI node references a stored API key)
 |-- has many       --> Connection    (as the source — connections going out from this node)
 +-- has many       --> Connection    (as the destination — connections coming into this node)

Connection
 |-- belongs to --> Workflow
 |-- from       --> Node + output handle name    (default handle name is "main")
 +-- to         --> Node + input handle name     (default handle name is "main")

Execution
 |-- belongs to --> Workflow
 +-- tracks: status (RUNNING / SUCCESS / FAILED), output JSON, error message,
             start time, completion time, and the Inngest event ID for tracing
```

A couple of things worth noting: connections track named handles, which is how the Condition node routes to different branches. The `inngestEventId` on Execution is what you use to look up a run in the Inngest Dev Server.

---

## Environment Variables Reference

A quick reference for every variable the app reads. If a variable is marked required and it is missing, the app will crash or behave incorrectly.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Random secret for signing auth tokens |
| `BETTER_AUTH_URL` | Yes | Base URL of the app (e.g. `http://localhost:3000`) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth App client secret |
| `ENCRYPTION_KEY` | Yes | 32-character hex key for encrypting stored credentials |
| `WEBHOOK_SECRET` | Yes | Secret for validating incoming webhook requests |
| `NEXT_PUBLIC_APP_URL` | Yes | Public-facing app URL — prefixed with `NEXT_PUBLIC_` so the browser can read it |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Google AI / Gemini API key |
| `ANTHROPIC_API_KEY` | No | Anthropic Claude API key |
| `OPENAI_AI_KEY` | No | OpenAI API key |
| `POLAR_ACCESS_TOKEN` | No | Polar.sh API token for billing |
| `POLAR_SUCCESS_URL` | No | Where users land after a successful checkout |
| `POLAR_SERVER` | No | `sandbox` for local dev, `production` for live |
| `SENTRY_AUTH_TOKEN` | No | Sentry token for uploading source maps during build |
| `NGROK_URL` | No | Your ngrok static domain for local webhook testing |

---

## Contributing

The project is set up to make contributing reasonably painless. Follow this flow:

1. Fork the repository and clone your fork locally.

2. Create a branch with a name that actually describes what you are doing:
   ```bash
   git checkout -b feature/add-notion-node
   ```

3. Make your changes. Write clean code. Add comments where the logic is non-obvious.

4. Run the linter before committing. This is not optional:
   ```bash
   npm run lint
   ```
   If it fails, fix the issues. Do not open a PR with lint errors — it will be sent back.

5. Commit with a message that a future developer (possibly yourself at 2am) will understand:
   ```bash
   git commit -m "feat: add Notion node for creating database entries"
   ```

6. Push and open a Pull Request against `main`. Describe what you changed and why.

---

## License

This project is private and proprietary. All rights reserved. (c) 2026 Weave.

---

<div align="center">
Built with Next.js, Prisma, Inngest, and tRPC.
</div>
