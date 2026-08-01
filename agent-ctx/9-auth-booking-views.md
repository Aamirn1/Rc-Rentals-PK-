# Task 9 — Auth & Booking Views Agent

## Task
Create 4 React client view components for RC Rentals PK SPA:
- `login-view.tsx` → `LoginView`
- `signup-view.tsx` → `SignupView`
- `booking-view.tsx` → `BookingView`
- `profile-view.tsx` → `ProfileView`

## Context Review
Read `/home/z/my-project/worklog.md` to learn the foundation:
- Zustand store `useAppStore` exposes `view, selectedCarId, bookingDraft, user, setView, setUser, logout, setBookingDraft`.
- `@/lib/vehicle-utils` provides `parseImages, formatPKR, daysBetween, formatDate, toVehicleWithImages, Vehicle, VehicleWithImages`.
- Dark theme with `bg-card`, `text-primary` (amber/gold), `text-accent` (emerald), `glass`, `card-lift`, `animate-fade-up`, `text-gradient-gold`.
- API routes: `/api/auth/{login,signup,logout}`, `/api/bookings`, `/api/cars/[id]`.
- shadcn/ui components available in `@/components/ui/*`. `toast` from `sonner`.
- Demo credentials: admin `amir0315794492@gmail.com` / `@#$&16609`, customer `customer@demo.com` / `demo1234`.

## Work Log

### login-view.tsx
- Centered card (max-w-md) with `ShimmerLogo as="h1"` + "Welcome back" subtitle.
- Email + password inputs with leading icons (Mail, Lock).
- Show/hide password toggle (Eye/EyeOff) with aria-label.
- Inline validation: email regex, password non-empty. Errors rendered with `aria-describedby`.
- Loading state: spinner + "Signing in…" text on the submit button.
- On success: `setUser(user)`, `toast.success("Welcome back, {firstName}!")`, route by role (`ADMIN` → admin, else home).
- On error: `toast.error(data.error)`.
- Demo credentials hint box with two tappable rows (Admin / Customer) that auto-fill the form. Each row shows email + password.
- "Don't have an account? Sign up" link → `setView("signup")`.

### signup-view.tsx
- Centered card with `ShimmerLogo as="h1"` + "Create your account" subtitle.
- Fields: name (min 2), email, optional phone, password (min 6, with strength meter), confirm password (with match check + CheckCircle2 indicator when matching).
- Show/hide toggles for both password fields.
- Validation: name ≥ 2 chars, email format, phone pattern, password ≥ 6 chars, passwords match.
- Loading state with spinner.
- On success: `setUser(user)`, `toast.success("Account created! Welcome to RC Rentals PK.")`, `setView("home")`.
- Terms/info notice box at bottom.
- "Already have an account? Login" → `setView("login")`.

### booking-view.tsx
- Reads `bookingDraft` from store; if null → empty state with "Browse Cars" button (`setView("cars")`).
- Reads `user` from store; prefill customer name/phone/email from user if logged in (via effect, only fills when empty).
- Fetches vehicle: `GET /api/cars/{vehicleId}` → `{success, car}` → `toVehicleWithImages`. Skeleton while loading.
- 2-column desktop layout (`lg:grid-cols-[1fr_380px]`), stacked mobile. Right column sticky (`lg:sticky lg:top-24`).
- Summary card (right): car image (with type/driver badges), brand+model, city, pickup/drop-off dates (formatDate), duration (daysBetween), price breakdown (rental = pricePerDay × days, driver fee = withDriver ? days × 2500 : 0, total). Server-side computation note.
- Form (left): Trip details card (read-only date inputs from draft, editable pickup location, optional dropoff, withDriver Switch). Customer info card (name/phone/email + optional notes textarea with char counter). Payment method card (RadioGroup: Cash, JazzCash, Easypaisa, Bank Transfer, Card — display only with note). Mobile submit button at form bottom (with total), desktop submit button in sticky summary (uses `formRef.requestSubmit()`).
- Validation: dates present, pickup ≥ 2 chars, name ≥ 2, phone regex, email format. Errors render inline + toast.error.
- Submit: POST `/api/bookings` with all fields. On success: clear `bookingDraft(null)`, switch to success state showing booking ID (last 8 chars uppercase), vehicle, dates, pickup/dropoff, driver, status badge, total. Buttons: "Back to Home" (`setView("home")`) + "My Bookings" (`setView("profile")`).
- On error: toast.error.

### profile-view.tsx
- If `user` is null → "Please log in" empty state with Login + Sign up buttons.
- Header section: large Avatar with initials fallback (gold-tinted), name, role badge (ADMIN gold / CUSTOMER emerald), email + phone (with icons).
- Admin-only "Go to Admin Dashboard" button (`setView("admin")`).
- Logout button (red outline) → calls `logout()` from store + toast.success.
- "My Bookings" section rendered via a keyed `<BookingsList key={user.id} />` child component to satisfy the React `react-hooks/set-state-in-effect` rule (component remounts on user change → `useState(true)` reinitializes loading correctly).
- `BookingsList` fetches `GET /api/bookings` on mount. Skeleton loaders (3 cards) while fetching.
- Empty state: "No bookings yet" with "Browse Cars" button.
- Each booking rendered via `BookingCard` (Collapsible): thumbnail + brand/model + city/type + status badge (color-coded: PENDING=amber, CONFIRMED=emerald, COMPLETED=muted, CANCELLED=red/destructive) + pickup/dropoff dates + total + driver badge. Clickable to expand: booking ID, locations, customer info, booked-on date, payment status. Notes shown if present.

## Quality Checks
- All 4 files start with `"use client"` and export the named function.
- Mobile-first responsive; forms max-w-md; touch-friendly inputs (h-9/h-10/h-11).
- Loading states (spinners, skeletons) on every async fetch.
- Accessible: `<Label htmlFor>`, `aria-invalid`, `aria-describedby`, `aria-label` on icon buttons, `aria-expanded`/`aria-controls` on collapsibles, semantic `<section>`, `<aside>`, `<form>`.
- Uses `formatPKR`, `formatDate`, `daysBetween`, `parseImages`, `toVehicleWithImages`.
- Plain `<img loading="lazy" onError→/favicon.svg>` (no next/image).
- No indigo/blue; only amber primary + emerald accent + destructive red + muted gray.
- No footer added (handled by app shell).

## Lint Result
- `bun run lint`: only pre-existing errors remain (`typewriter.tsx` line 37, `use-auth.ts` line 23 — both created in Task 0, NOT touched by this agent).
- **Zero errors in any of the 4 new view files.**

## Stage Summary
All 4 auth/booking/profile views are wired into the SPA router (`page.tsx` already imports them via dynamic imports). The full customer booking flow now works end-to-end:
1. Browse cars → select → booking draft created
2. BookingView: review summary + fill customer info → POST /api/bookings → success screen
3. Login/Signup: authenticates via API, sets user in store, routes by role
4. Profile: shows user info + their bookings with expandable details + logout
