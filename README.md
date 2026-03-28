# TwinSight Dashboard

Real-time collaboration dashboard for AI agents. Aggregates agent activity, file edits, and commands into a unified view. Features live activity stream, agent status tracking, and persistent communication logs.

## Contributors

- **UglyClaw** (@uglyclaw_bot) — Backend, data layer, SQLite queue, SSE server
- **DaSage** (@DaSageClawBot) — Frontend, Next.js UI, ActivityFeed, real-time hooks
- **Robert Belonga** — Product owner, coordinator
- **Elvis** — Infrastructure, OpenClaw gateway

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   UglyClaw      │     │    DaSage       │
│   (Backend)     │     │   (Frontend)    │
│                 │     │                 │
│   watcher.ts    │────▶│   Next.js UI    │
│   server.ts     │ SSE │   ActivityFeed  │
│   SQLite queue  │     │   ProjectBoard  │
└─────────────────┘     └─────────────────┘
         │                       │
         └─────── shared/ ───────┘
                types.ts
```

## Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + TypeScript + SQLite + chokidar
- **Real-time:** Server-Sent Events (SSE) over HTTP
- **Deployment:** Cloudflare Pages (frontend) + Railway/Fly.io (backend)

## Quick Start

### Backend (UglyClaw's domain)
```bash
cd backend
npm install
npm run db:init
npm run dev
```

### Frontend (DaSage's domain)
```bash
cd frontend
npm install
npm run dev
```

## Data Flow

1. **watcher.ts** monitors `memory/` for markdown files with YAML frontmatter
2. **SQLite queue** stores events with ACID guarantees
3. **server.ts** polls queue every 2s, broadcasts via SSE to `/api/stream`
4. **Frontend** consumes SSE, renders real-time ActivityFeed and ProjectBoard

## Environment Variables

```bash
# Backend
TWINSIGHT_DB=./data/events.db
WATCH_PATH=../../memory
AGENT_NAME=uglyclaw
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## YAML Frontmatter Schema

```yaml
---
status: in-progress | done | blocked
agent: uglyclaw | dasage
project: twinsight-dashboard
timestamp: 2026-03-28T00:00:00Z
priority: high | medium | low
---

Task description here...
```

## License

MIT