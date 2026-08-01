"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppStore } from "@/lib/store";
import { formatPKR, formatDate, parseImages } from "@/lib/vehicle-utils";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  ShieldCheck,
  LogOut,
  Car,
  MapPin,
  Zap,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Inbox,
  Banknote,
  Hash,
  User as UserIcon,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingVehicle {
  brand: string;
  model: string;
  type: string;
  city: string;
  images: string;
}

interface BookingPayment {
  status: string;
  method: string;
  amount: number;
}

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  withDriver: boolean;
  pickupLocation: string;
  dropoffLocation?: string | null;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string | null;
  createdAt: string;
  vehicle: BookingVehicle;
  payment?: BookingPayment | null;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-primary/15 text-primary border border-primary/30",
  CONFIRMED: "bg-accent/15 text-accent border border-accent/30",
  COMPLETED: "bg-muted text-muted-foreground border border-border",
  CANCELLED: "bg-destructive/15 text-destructive border border-destructive/30",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function BookingCard({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const images = parseImages(booking.vehicle.images);
  const img = images[0] || "/favicon.svg";
  const v = booking.vehicle;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="bg-card border-border overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full text-left flex flex-col sm:flex-row gap-4 p-4 hover:bg-accent/5 transition-colors"
            aria-expanded={open}
            aria-controls={`booking-detail-${booking.id}`}
          >
            <div className="relative w-full sm:w-40 aspect-[16/10] sm:aspect-square shrink-0 rounded-md overflow-hidden bg-muted">
              <img
                src={img}
                alt={`${v.brand} ${v.model} rental car`}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/favicon.svg";
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg leading-tight truncate">
                    {v.brand} {v.model}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {v.city} · {v.type}
                  </p>
                </div>
                <Badge className={cn("shrink-0", STATUS_STYLES[booking.status])}>{booking.status}</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Pickup</p>
                  <p className="font-medium">{formatDate(booking.startDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Drop-off</p>
                  <p className="font-medium">{formatDate(booking.endDate)}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold text-primary">{formatPKR(booking.totalAmount)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs">
                {booking.withDriver && (
                  <Badge variant="secondary" className="gap-1 bg-accent/15 text-accent border-accent/30">
                    <Zap className="w-3 h-3" /> With Driver
                  </Badge>
                )}
                <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                  {open ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" /> Hide details
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3.5 h-3.5" /> View details
                    </>
                  )}
                </span>
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent id={`booking-detail-${booking.id}`}>
          <div className="px-4 pb-4">
            <Separator className="mb-4" />
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <DetailRow icon={Hash} label="Booking ID" value={`#${booking.id.slice(-8).toUpperCase()}`} mono />
              <DetailRow icon={MapPin} label="Pickup Location" value={booking.pickupLocation} />
              {booking.dropoffLocation && (
                <DetailRow icon={MapPin} label="Drop-off Location" value={booking.dropoffLocation} />
              )}
              <DetailRow icon={UserIcon} label="Customer" value={booking.customerName} />
              <DetailRow icon={Phone} label="Phone" value={booking.customerPhone} />
              <DetailRow icon={Mail} label="Email" value={booking.customerEmail} />
              <DetailRow
                icon={Clock}
                label="Booked On"
                value={formatDate(booking.createdAt)}
              />
              <DetailRow
                icon={Banknote}
                label="Payment"
                value={
                  booking.payment
                    ? `${booking.payment.method} · ${booking.payment.status}`
                    : "Pay at pickup"
                }
              />
            </div>

            {booking.notes && (
              <div className="mt-4 rounded-md border border-border bg-muted/40 p-3 text-sm">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Notes</p>
                <p className="text-foreground whitespace-pre-wrap">{booking.notes}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("font-medium break-words", mono && "font-mono")}>{value}</p>
      </div>
    </div>
  );
}

export function ProfileView() {
  const user = useAppStore((s) => s.user);
  const setView = useAppStore((s) => s.setView);
  const logout = useAppStore((s) => s.logout);

  // Not logged in
  if (!user) {
    return (
      <div className="animate-fade-up min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Card className="max-w-md w-full p-8 text-center bg-card border-border">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-muted">
            <UserIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Please log in</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in to view your profile, manage bookings, and track reservations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setView("login")} className="flex-1 h-10">
              Login
            </Button>
            <Button variant="outline" onClick={() => setView("signup")} className="flex-1 h-10">
              Sign up
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";
  const initials = getInitials(user.name);

  return (
    <div className="animate-fade-up">
      {/* Profile header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="size-16 sm:size-20 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{user.name}</h1>
                <Badge
                  className={
                    isAdmin
                      ? "bg-primary/15 text-primary border border-primary/30 gap-1"
                      : "bg-accent/15 text-accent border border-accent/30 gap-1"
                  }
                >
                  <ShieldCheck className="w-3 h-3" /> {user.role}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {user.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {isAdmin && (
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => setView("admin")}
                >
                  <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                </Button>
              )}
              <Button
                variant="outline"
                className="h-10 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  logout();
                  toast.success("You've been logged out.");
                }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bookings */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <BookingsList key={user.id} />
      </section>
    </div>
  );
}

function BookingsList() {
  const setView = useAppStore((s) => s.setView);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/bookings")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load bookings.");
        return (data.bookings ?? []) as Booking[];
      })
      .then((list) => {
        if (cancelled) return;
        setBookings(list);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(err instanceof Error ? err.message : "Failed to load bookings.");
        setBookings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" /> My Bookings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {!loading && bookings.length > 0
              ? `${bookings.length} reservation${bookings.length !== 1 ? "s" : ""}.`
              : "Your reservations will appear here."}
          </p>
        </div>
        {bookings.length > 0 && (
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setView("cars")}>
            <Car className="w-4 h-4" /> Book another
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-4 bg-card border-border">
              <div className="flex gap-4">
                <Skeleton className="w-40 aspect-square rounded-md shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-10 text-center bg-card border-border">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-muted">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-2">No bookings yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            You haven&apos;t made any reservations. Browse our fleet and book your first ride today — from
            economical hatchbacks to luxury SUVs.
          </p>
          <Button onClick={() => setView("cars")} className="h-10">
            <Car className="w-4 h-4" /> Browse Cars
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="mt-6 sm:hidden">
          <Button variant="outline" className="w-full h-10" onClick={() => setView("cars")}>
            <Car className="w-4 h-4" /> Book another car
          </Button>
        </div>
      )}
    </>
  );
}
