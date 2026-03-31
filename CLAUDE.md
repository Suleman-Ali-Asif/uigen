# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator. Users describe React components in natural language via chat, and Claude generates them with live preview. It uses a virtual (in-memory) file system — components are never written to disk.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development (Turbopack)
npm run dev

# Production build
npm run build

# Tests
npm test
npx vitest run src/lib/__tests__/file-system.test.ts  # single test file

# Lint
npm run lint

# Database reset
npm run db:reset
```

## Environment

Copy `.env` and add your key (optional — without it, a mock generator runs):
```
ANTHROPIC_API_KEY=""
```

## Architecture

### Three-Panel UI (`src/app/main-content.tsx`)
- **Left (35%):** Chat interface — user messages + AI responses
- **Right (65%):** Tabbed view — Live Preview OR Code Editor
  - Code view splits into File Tree (30%) + Monaco Editor (70%)

### AI Generation Flow
1. User types in chat → `ChatInterface` in `src/components/chat/`
2. Messages POSTed to `src/app/api/chat/route.ts`
3. Backend calls Claude (or mock) via Vercel AI SDK with two tools:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create/edit files
   - `file_manager` (`src/lib/tools/file-manager.ts`) — delete files/dirs
4. Tool calls update the virtual file system, which triggers preview re-render

### Virtual File System (`src/lib/file-system.ts`)
Central abstraction. Components exist only in memory as a `VirtualFileSystem` object, which is serialized as JSON into the `Project.data` DB column. All file operations go through `VirtualFileSystemContext` (`src/lib/contexts/file-system-context.tsx`).

### AI Provider Selection (`src/lib/provider.ts`)
- If `ANTHROPIC_API_KEY` is set → uses `claude-haiku-4-5` via `@ai-sdk/anthropic`
- Otherwise → uses `MockLanguageModel` which returns predefined components

### Authentication & Persistence
- JWT sessions via `jose`, stored in httpOnly cookies; logic in `src/lib/auth.ts`
- Server actions in `src/actions/` handle auth and project CRUD
- Anonymous work stored in `localStorage` via `src/lib/anon-work-tracker.ts`
- Prisma + SQLite: two models — `User` and `Project` (stores `messages` and `data` as JSON strings)

### JSX Preview (`src/lib/transform/jsx-transformer.ts`)
Uses Babel standalone at runtime to compile JSX from the virtual file system into executable JS for the live preview panel.

### System Prompt (`src/lib/prompts/generation.tsx`)
Instructs Claude to generate React components using Tailwind CSS v4 and write them via the `str_replace_editor` tool.

## Code Style

- Use comments sparingly — only for complex or non-obvious logic

## Database

Schema is defined in `prisma/schema.prisma`. Reference it when reasoning about DB structure. Two models:
- `User` — id, email (unique), password, timestamps; has many Projects
- `Project` — id, name, nullable userId (anon projects), messages (JSON string), data (JSON string for virtual FS), timestamps

## Key Conventions

- Path alias `@/*` maps to `src/*`
- Tests live in `__tests__/` subdirectories alongside their source files
- Vitest with JSDOM environment for all tests
- `node-compat.cjs` is required via `NODE_OPTIONS` to polyfill Node APIs — all npm scripts already include this
