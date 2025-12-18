# DCCF Essential – Project Overview

DCCF Essential is a Next.js 14 project using the App Router and TypeScript.

## Project Structure
- src/app/ — App Router (no pages/)
- src/components/ — shared UI components
- src/lib/ — core logic and utilities
- src/hooks/ — custom React hooks

## Architectural Rules
- App Router only
- Server Components by default
- Client Components only when required
- API routes live in src/app/api
- No references to build artifacts (.next) or dependencies (node_modules)

## Development Commands
- npm run dev
- npm run dev:fresh
- npm run dev:clean

## Engineering Principles
- Prefer existing patterns over new abstractions
- Minimal dependencies
- Explicit, reversible changes
- Production-grade TypeScript discipline
