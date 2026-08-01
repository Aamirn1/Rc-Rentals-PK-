# Task 10 — AdminView Builder

## Task
Build the Admin Dashboard view for RC Rentals PK as a single client component file `src/components/views/admin-view.tsx` exporting `AdminView()`. Role-protected (ADMIN only), with 5 tabs: Overview, Cars, Bookings, Users, Messages.

## Context Used
- Read `/home/z/my-project/worklog.md` for foundation context (store, lib helpers, API endpoints, design system, admin credentials).
- Read `/home/z/my-project/src/lib/vehicle-utils.ts` for helper signatures.
- Read `/home/z/my-project/src/lib/store.ts` for `useAppStore` API + `CurrentUser` shape.
- Read `/home/z/my-project/src/components/views/contact-view.tsx` for code conventions in this codebase.
- Inspected shadcn/ui component exports (alert-dialog, table, tabs, dialog, select, switch, badge) to use the correct named exports.

## Output
- Wrote `/home/z/my-project/src/components/views/admin-view.tsx` (~1000 lines, single client component).
- Lint: passes with zero errors in this file (`bunx eslint src/components/views/admin-view.tsx` → clean).
- Did NOT touch other files. The pre-existing lint errors in `typewriter.tsx` and `use-auth.ts` are out of scope.

## Key Decisions
- Each tab is its own sub-component that lazily fetches its own data on mount (radix Tabs unmounts inactive content by default, so useEffects fire when the tab is activated).
- `let alive` guards in effects for safe unmount during async fetches.
- All fetches use `credentials: "include"` so the session cookie is sent automatically.
- Color palette strictly amber/gold (primary) + emerald (accent) + muted + red-destructive — no indigo/blue.
- Car images use plain `<img loading="lazy">` with `onError` fallback to `/favicon.svg`.
- Delete confirmation uses AlertDialog; status changes use inline Select per booking row.
- Mobile-first responsive: TabsList scrolls horizontally on mobile, tables wrap in `max-h-[60vh] overflow-y-auto` with sticky headers, grids collapse from 4-col to 2-col on mobile.

## Worklog
Appended a new section to `/home/z/my-project/worklog.md` (after `---`) with Task ID 10, agent name, task, work log, and stage summary.
