"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ShimmerLogo } from "@/components/effects/shimmer-logo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppStore } from "@/lib/store";
import {
  formatPKR,
  formatDate,
  daysBetween,
  toVehicleWithImages,
  type VehicleWithImages,
  type Vehicle,
} from "@/lib/vehicle-utils";
import { toast } from "sonner";
import {
  CalendarDays,
  MapPin,
  Car,
  Wallet,
  CreditCard,
  Smartphone,
  Landmark,
  Banknote,
  CheckCircle2,
  ArrowLeft,
  ClipboardList,
  User as UserIcon,
  FileText,
  Zap,
  Loader2,
  Info,
} from "lucide-react";

const DRIVER_FEE_PER_DAY = 2500;

const PAYMENT_METHODS = [
  { id: "CASH", label: "Cash on Pickup", icon: Banknote, desc: "Pay with cash when you collect the vehicle" },
  { id: "JAZZCASH", label: "JazzCash", icon: Smartphone, desc: "Mobile wallet transfer" },
  { id: "EASYPAISA", label: "Easypaisa", icon: Smartphone, desc: "Mobile wallet transfer" },
  { id: "BANK", label: "Bank Transfer", icon: Landmark, desc: "Direct bank deposit" },
  { id: "CARD", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa / Mastercard" },
];

interface CreatedBooking {
  id: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  withDriver: boolean;
  pickupLocation: string;
  dropoffLocation?: string | null;
  status: string;
}

export function BookingView() {
  const bookingDraft = useAppStore((s) => s.bookingDraft);
  const setBookingDraft = useAppStore((s) => s.setBookingDraft);
  const user = useAppStore((s) => s.user);
  const setView = useAppStore((s) => s.setView);

  const [vehicle, setVehicle] = useState<VehicleWithImages | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  const [withDriver, setWithDriver] = useState(bookingDraft?.withDriver ?? false);
  const [pickup, setPickup] = useState(bookingDraft?.pickupLocation ?? "");
  const [dropoff, setDropoff] = useState("");
  const [customerName, setCustomerName] = useState(user?.name ?? "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone ?? "");
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? "");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedBooking | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Fetch vehicle details on mount / when draft changes
  useEffect(() => {
    if (!bookingDraft) {
      setVehicle(null);
      return;
    }
    let cancelled = false;
    setVehicleLoading(true);
    setVehicleError(null);
    fetch(`/api/cars/${bookingDraft.vehicleId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || !data.success || !data.car) {
          throw new Error(data.error || "Vehicle not found.");
        }
        return data.car as Vehicle;
      })
      .then((c) => {
        if (cancelled) return;
        setVehicle(toVehicleWithImages(c));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setVehicleError(err instanceof Error ? err.message : "Failed to load vehicle.");
      })
      .finally(() => {
        if (!cancelled) setVehicleLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingDraft]);

  // Prefill customer info once user becomes available
  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.name);
      setCustomerPhone((prev) => prev || (user.phone ?? ""));
      setCustomerEmail((prev) => prev || user.email);
    }
  }, [user]);

  const days = useMemo(() => {
    if (!bookingDraft) return 0;
    return daysBetween(bookingDraft.startDate, bookingDraft.endDate);
  }, [bookingDraft]);

  const priceBreakdown = useMemo(() => {
    const perDay = vehicle?.pricePerDay ?? 0;
    const rental = perDay * days;
    const driverFee = withDriver ? days * DRIVER_FEE_PER_DAY : 0;
    return { perDay, rental, driverFee, total: rental + driverFee };
  }, [vehicle, days, withDriver]);

  // ---- Empty state: no draft (but not after a successful booking) ----
  if (!bookingDraft && !created) {
    return (
      <div className="animate-fade-up min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Card className="max-w-md w-full p-8 text-center bg-card border-border">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-muted">
            <Car className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">No car selected for booking</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Pick a vehicle from our fleet first, then tap <span className="text-foreground font-medium">Book Now</span> to start a reservation.
          </p>
          <Button onClick={() => setView("cars")} className="w-full h-10">
            <Car className="w-4 h-4" /> Browse Cars
          </Button>
        </Card>
      </div>
    );
  }

  // ---- Success state ----
  if (created) {
    return (
      <div className="animate-fade-up min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Card className="max-w-lg w-full p-6 sm:p-8 bg-card border-border">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-accent/15 border border-accent/30">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <ShimmerLogo as="h1" className="text-xl mb-1" />
            <h2 className="text-2xl font-bold mt-1">Booking Confirmed!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your reservation has been placed. We&apos;ll contact you shortly to confirm pickup details.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3 text-sm mb-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Booking ID</span>
              <Badge variant="secondary" className="font-mono">
                #{created.id.slice(-8).toUpperCase()}
              </Badge>
            </div>
            {vehicle && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vehicle</span>
                <span className="font-medium text-right">
                  {vehicle.brand} {vehicle.model}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pickup Date</span>
              <span className="font-medium">{formatDate(created.startDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Drop-off Date</span>
              <span className="font-medium">{formatDate(created.endDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pickup Location</span>
              <span className="font-medium text-right">{created.pickupLocation}</span>
            </div>
            {created.dropoffLocation && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Drop-off Location</span>
                <span className="font-medium text-right">{created.dropoffLocation}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">With Driver</span>
              <span className="font-medium">{created.withDriver ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">Status</span>
              <Badge className="bg-primary/15 text-primary border border-primary/30">PENDING</Badge>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold">Total Amount</span>
              <span className="text-xl font-bold text-primary">{formatPKR(created.totalAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 h-10" onClick={() => setView("home")}>
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
            <Button className="flex-1 h-10" onClick={() => setView("profile")}>
              <ClipboardList className="w-4 h-4" /> My Bookings
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const validate = () => {
    const next: Record<string, string> = {};
    if (!bookingDraft.startDate) next.startDate = "Pickup date is required.";
    if (!bookingDraft.endDate) next.endDate = "Drop-off date is required.";
    if (days < 1) next.dates = "Drop-off date must be after pickup date.";
    if (!pickup.trim() || pickup.trim().length < 2) next.pickup = "Pickup location is required.";
    if (!customerName.trim() || customerName.trim().length < 2)
      next.customerName = "Customer name is required (min 2 chars).";
    if (!customerPhone.trim() || !/^[0-9+\-\s]{4,20}$/.test(customerPhone.trim()))
      next.customerPhone = "Enter a valid phone number.";
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim()))
      next.customerEmail = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please complete all required fields correctly.");
      return false;
    }
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: bookingDraft.vehicleId,
          startDate: bookingDraft.startDate,
          endDate: bookingDraft.endDate,
          withDriver,
          pickupLocation: pickup.trim(),
          dropoffLocation: dropoff.trim() || undefined,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Booking failed. Please try again.");
        return;
      }
      setCreated({
        id: data.booking.id,
        totalAmount: data.booking.totalAmount,
        startDate: data.booking.startDate,
        endDate: data.booking.endDate,
        withDriver: data.booking.withDriver,
        pickupLocation: data.booking.pickupLocation,
        dropoffLocation: data.booking.dropoffLocation,
        status: data.booking.status,
      });
      setBookingDraft(null);
      toast.success("Booking placed successfully!");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const carImg = vehicle?.images[0] || "/favicon.svg";

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-primary/20">
            <CalendarDays className="w-3 h-3" /> Reservation
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Complete Your <span className="text-gradient-gold">Booking</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
            Review the details, fill in your information, and confirm. Payments are collected at pickup or
            confirmed by our admin team.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
          {/* ---- LEFT: Form ---- */}
          <form ref={formRef} onSubmit={submit} className="space-y-6" noValidate>
            {/* Trip details */}
            <Card className="p-5 sm:p-6 bg-card border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Trip Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Pickup Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={bookingDraft.startDate.slice(0, 10)}
                    readOnly
                    disabled
                    aria-describedby={errors.dates ? "dates-error" : undefined}
                  />
                  <p className="text-xs text-muted-foreground">Set on the car details page.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Drop-off Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={bookingDraft.endDate.slice(0, 10)}
                    readOnly
                    disabled
                    aria-describedby={errors.dates ? "dates-error" : undefined}
                  />
                  <p className="text-xs text-muted-foreground">{days} day{days !== 1 ? "s" : ""} total.</p>
                </div>
              </div>
              {errors.dates && (
                <p id="dates-error" className="text-xs text-destructive mt-2">
                  {errors.dates}
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup">Pickup Location *</Label>
                  <Input
                    id="pickup"
                    value={pickup}
                    onChange={(e) => {
                      setPickup(e.target.value);
                      if (errors.pickup) setErrors((p) => ({ ...p, pickup: "" }));
                    }}
                    placeholder="e.g. Islamabad Airport"
                    aria-invalid={!!errors.pickup}
                    aria-describedby={errors.pickup ? "pickup-error" : undefined}
                    maxLength={200}
                  />
                  {errors.pickup && (
                    <p id="pickup-error" className="text-xs text-destructive">
                      {errors.pickup}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropoff">
                    Drop-off Location <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="dropoff"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    placeholder="e.g. Lahore Airport"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-border">
                <div>
                  <Label htmlFor="driverSwitch" className="cursor-pointer">
                    Rent with Driver
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {withDriver
                      ? "Professional chauffeur included."
                      : "Self-drive. License required at pickup."}
                  </p>
                </div>
                <Switch
                  id="driverSwitch"
                  checked={withDriver}
                  onCheckedChange={setWithDriver}
                  aria-label="Toggle renting with a driver"
                />
              </div>
            </Card>

            {/* Customer details */}
            <Card className="p-5 sm:p-6 bg-card border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" /> Customer Information
              </h2>
              {!user && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Booking as a guest.{" "}
                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className="text-primary font-medium hover:underline"
                    >
                      Sign in
                    </button>{" "}
                    to save this booking to your account.
                  </span>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors((p) => ({ ...p, customerName: "" }));
                    }}
                    placeholder="Your full name"
                    autoComplete="name"
                    aria-invalid={!!errors.customerName}
                    aria-describedby={errors.customerName ? "name-error" : undefined}
                    maxLength={120}
                  />
                  {errors.customerName && (
                    <p id="name-error" className="text-xs text-destructive">
                      {errors.customerName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone *</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (errors.customerPhone) setErrors((p) => ({ ...p, customerPhone: "" }));
                    }}
                    placeholder="03xx-xxxxxxx"
                    autoComplete="tel"
                    inputMode="tel"
                    aria-invalid={!!errors.customerPhone}
                    aria-describedby={errors.customerPhone ? "phone-error" : undefined}
                    maxLength={20}
                  />
                  {errors.customerPhone && (
                    <p id="phone-error" className="text-xs text-destructive">
                      {errors.customerPhone}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (errors.customerEmail) setErrors((p) => ({ ...p, customerEmail: "" }));
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={!!errors.customerEmail}
                    aria-describedby={errors.customerEmail ? "email-error" : undefined}
                    maxLength={120}
                  />
                  {errors.customerEmail && (
                    <p id="email-error" className="text-xs text-destructive">
                      {errors.customerEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="notes">
                  Notes <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests? e.g. child seat, airport meet-and-greet, flight number…"
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">{notes.length}/1000</p>
              </div>
            </Card>

            {/* Payment method */}
            <Card className="p-5 sm:p-6 bg-card border-border">
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" /> Payment Method
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Payment is collected at pickup or confirmed by our admin team. Online card processing is not yet
                available.
              </p>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-2">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <Label
                      key={m.id}
                      htmlFor={`pm-${m.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <RadioGroupItem id={`pm-${m.id}`} value={m.id} />
                      <Icon className="w-4 h-4 text-muted-foreground" aria-hidden />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium">{m.label}</span>
                        <span className="block text-xs text-muted-foreground">{m.desc}</span>
                      </span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </Card>

            {/* Submit (mobile) */}
            <div className="lg:hidden">
              <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Confirming…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Confirm Booking · {formatPKR(priceBreakdown.total)}
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* ---- RIGHT: Summary (sticky) ---- */}
          <aside className="lg:sticky lg:top-24">
            <Card className="p-5 sm:p-6 bg-card border-border">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Booking Summary
              </h2>

              {vehicleLoading ? (
                <div className="space-y-3">
                  <Skeleton className="aspect-[16/10] w-full rounded-md" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : vehicleError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {vehicleError}
                </div>
              ) : vehicle ? (
                <>
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-muted mb-3">
                    <img
                      src={carImg}
                      alt={`${vehicle.brand} ${vehicle.model} rental car`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/favicon.svg";
                      }}
                    />
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <Badge className="bg-primary text-primary-foreground border-0">{vehicle.type}</Badge>
                      {withDriver && (
                        <Badge variant="secondary" className="gap-1 bg-accent/20 text-accent border-accent/30">
                          <Zap className="w-3 h-3" /> Driver
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold leading-tight">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {vehicle.city}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pickup</span>
                      <span className="font-medium">{formatDate(bookingDraft.startDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Drop-off</span>
                      <span className="font-medium">{formatDate(bookingDraft.endDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{days} day{days !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <div className="my-4 h-px bg-border" />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {formatPKR(vehicle.pricePerDay)} × {days} day{days !== 1 ? "s" : ""}
                      </span>
                      <span className="font-medium">{formatPKR(priceBreakdown.rental)}</span>
                    </div>
                    {withDriver && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Driver fee · {formatPKR(DRIVER_FEE_PER_DAY)} × {days}
                        </span>
                        <span className="font-medium">{formatPKR(priceBreakdown.driverFee)}</span>
                      </div>
                    )}
                  </div>

                  <div className="my-4 h-px bg-border" />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">{formatPKR(priceBreakdown.total)}</span>
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-3">
                    Final price computed server-side. Driver fee is Rs {DRIVER_FEE_PER_DAY.toLocaleString()} per day
                    when selected.
                  </p>
                </>
              ) : null}

              {/* Submit (desktop sticky) */}
              <Button
                type="button"
                size="lg"
                className="w-full h-11 mt-5 hidden lg:flex"
                disabled={submitting || vehicleLoading || !!vehicleError}
                onClick={() => formRef.current?.requestSubmit()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Confirming…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Confirm Booking
                  </>
                )}
              </Button>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}
