# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Mobile App (TaskMaster)

A full-featured To-Do List application built with Expo (React Native) using AsyncStorage for local persistence.

### Features
- Task CRUD with title, description, priority (high/medium/low), category, deadline, and status
- Smart reminder system with expo-notifications (pre-deadline alerts, deadline notifications)
- Automatic overdue detection
- Task filtering by status, priority, and search
- Calendar view showing tasks by date
- Analytics dashboard with completion stats, productivity metrics, and category/priority breakdowns
- Settings with notification controls and data management

### Architecture
- **State management**: React Context (TaskContext, ReminderContext) with AsyncStorage persistence
- **Navigation**: Expo Router with file-based routing, 4 tabs (Tasks, Calendar, Analytics, Settings)
- **Styling**: React Native StyleSheet with semantic color tokens (light/dark mode support)
- **Notifications**: expo-notifications for scheduled reminders
- **Date picker**: @react-native-community/datetimepicker

### Key Files
- `artifacts/mobile/context/TaskContext.tsx` — All task CRUD, filtering, sorting, and stats
- `artifacts/mobile/context/ReminderContext.tsx` — Notification scheduling and permissions
- `artifacts/mobile/types/task.ts` — Task, Priority, Category, Status types
- `artifacts/mobile/constants/colors.ts` — Theme tokens
- `artifacts/mobile/app/(tabs)/` — Tab screens (index, calendar, analytics, settings)
- `artifacts/mobile/app/task/` — Task creation and detail/edit screens

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
