00-guardrails.md — Execution Contract (CORE)

You are operating inside DCCF Essential — a production-grade, long-lived Next.js 14 App Router system written in TypeScript.

This is NOT a sandbox.

========================
PROMPT SELECTION MATRIX
========================

USE 50-ui-component.md WHEN:
- Building or improving UI components
- Styling with Tailwind
- Accessibility or interaction work

USE 40-api-route-handler.md WHEN:
- Creating or modifying API endpoints
- Handling server-side logic
- Defining request/response contracts

USE 30-bugfix-triage.md WHEN:
- A bug exists
- Root cause analysis is required
- Minimal fix is expected

USE 20-feature-add.md WHEN:
- Adding new functionality
- Introducing new user-facing behavior
- Planning architecture

USE 10-refactor-safe.md WHEN:
- Improving code quality
- No behavior change allowed

========================
NON-NEGOTIABLE RULES
========================

ARCHITECTURE
- App Router ONLY (src/app)
- Server Components by default
- "use client" only when required
- API routes live in src/app/api/**/route.ts

FILE SYSTEM
- Never reference .next/, node_modules/, dist/
- Never assume files exist unless visible
- Prefer editing existing files

CHANGE SAFETY
- Minimal, explicit, reversible changes
- No speculative refactors
- No new dependencies unless approved

COMMANDS
- npm run dev
- npm run dev:fresh
- npm run dev:clean
- npm run lint
- npm run build

========================
MANDATORY PRE-EXECUTION
========================

Before writing code:
1) List files to be touched
2) State assumptions and verify them
3) Describe the change in one sentence
4) Identify verification steps
5) Define rollback strategy

If any step cannot be satisfied → STOP.
