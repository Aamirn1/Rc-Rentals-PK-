# Task 7-8 — Views Builder (Home / Cars / Car Details)

**Agent:** Subagent — Views Builder
**Task:** Create `home-view.tsx`, `cars-view.tsx`, `car-details-view.tsx` (each `export function XView`).

## Files Created
1. `src/components/views/home-view.tsx` — `HomeView`
2. `src/components/views/cars-view.tsx` — `CarsView`
3. `src/components/views/car-details-view.tsx` — `CarDetailsView`

## Key Decisions
- All three are `"use client"` components, mobile-first, dark theme, amber primary / emerald accent, no indigo/blue.
- HomeView lazy-loads `Hero3DScene` via `next/dynamic({ ssr:false, loading: spinner })` and wraps it in a `glass` + `animate-float` panel.
- HomeView search bar uses local state seeded from `useAppStore.filters` so it pre-fills the CarsView when the user submits (`setFilters + setView("cars")`).
- CarsView reads filters directly from the store; the free-text query is debounced 350ms before triggering a refetch; the fetch effect depends on every individual filter field (not the `filters` object identity) plus the debounced query.
- CarsView mobile uses a left-side Sheet for filters; desktop uses a sticky sidebar (`top-20`).
- CarDetailsView booking widget: native `<input type="date">` (start min = today, end min = start), With Driver checkbox defaulting to `car.withDriver` (disabled + "Required" badge if driver is mandatory), driver fee = Rs 2500/day × days, total computed via `daysBetween`. On Book Now: validates dates/pickup, checks `user` from store (if null → toast + `setView("login")`), else `setBookingDraft` + `setView("booking")`.
- CarDetailsView reviews: list fetched from `/api/cars/[id]` (included `reviews` with `user.name`); review form POSTs to `/api/reviews` and refetches via `/api/reviews?vehicleId=` on success.

## Hand-off
- `bookingDraft` produced by CarDetailsView is consumed by the (next agent's) BookingView. Shape:
  ```ts
  { vehicleId, vehicleName: "Brand Model", startDate, endDate, withDriver, pickupLocation }
  ```

## Verification
- `bunx eslint` on the 3 files → **0 errors, 0 warnings**.
- `bunx tsc --noEmit` → **0 type errors** in the 3 view files (all remaining tsc errors are pre-existing in other agents' files).
- `bun run lint` → only pre-existing errors in `typewriter.tsx`, `profile-view.tsx`, `use-auth.ts`; none in the 3 new files. Per instructions, did NOT touch files outside the 3 created.
- Dev server log shows no errors related to these views (only seed queries).

## Notes for Downstream Agents
- The home search bar sets `filters.city`, `filters.type`, `filters.withDriver` and then `setView("cars")` — CarsView picks these up automatically.
- City cards on the home page call `setFilters({ city: cityName })` + `setView("cars")`.
- The CarDetailsView "With Driver" checkbox adds `DRIVER_FEE_PER_DAY = 2500` (constant in the file) per day — BookingView should use the same constant or read `bookingDraft.withDriver` and recompute.
- All images use `<img loading="lazy" onError={...→/favicon.svg}>` (no `next/image`).
