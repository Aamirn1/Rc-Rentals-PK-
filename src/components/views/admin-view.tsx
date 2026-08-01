"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Car as CarIcon,
  CalendarCheck,
  Users,
  MessageSquare,
  TrendingUp,
  Wallet,
  LogOut,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  Loader2,
  Inbox,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store";
import {
  formatPKR,
  formatDate,
  parseImages,
  toVehicleWithImages,
  type Vehicle,
} from "@/lib/vehicle-utils";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
type MessageStatus = "NEW" | "READ" | "RESOLVED";

interface AdminStats {
  totalCars: number;
  totalBookings: number;
  totalUsers: number;
  totalMessages: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  revenue: number;
  topCars: {
    id: string;
    brand: string;
    model: string;
    pricePerDay: number;
    _count: { bookings: number };
  }[];
  recentBookings: {
    id: string;
    status: BookingStatus;
    totalAmount: number;
    createdAt: string;
    customerName: string;
    vehicle: { brand: string; model: string };
    user: { name: string };
  }[];
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
  _count: { bookings: number };
}

interface AdminBooking {
  id: string;
  startDate: string;
  endDate: string;
  withDriver: boolean;
  pickupLocation: string;
  totalAmount: number;
  status: BookingStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  createdAt: string;
  vehicle: {
    brand: string;
    model: string;
    type: string;
    city: string;
    images: string;
  };
  user: { name: string; email: string };
  payment: { status: string; method: string } | null;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

interface CarFormState {
  brand: string;
  model: string;
  type: string;
  transmission: string;
  fuel: string;
  seats: string;
  doors: string;
  pricePerDay: string;
  city: string;
  withDriver: boolean;
  available: boolean;
  images: string; // newline separated URLs
  features: string; // newline separated
  description: string;
}

const CAR_TYPE_OPTIONS = ["Sedan", "SUV", "Hatchback", "Luxury", "Van", "Coupe", "Pickup"];
const TRANSMISSION_OPTIONS = ["Automatic", "Manual"];
const FUEL_OPTIONS = ["Petrol", "Diesel", "Hybrid", "Electric"];
const CITY_OPTIONS = [
  "Islamabad",
  "Rawalpindi",
  "Lahore",
  "Karachi",
  "Peshawar",
  "Multan",
  "Faisalabad",
  "Murree",
  "Naran",
  "Hunza",
];

const EMPTY_FORM: CarFormState = {
  brand: "",
  model: "",
  type: "Sedan",
  transmission: "Automatic",
  fuel: "Petrol",
  seats: "5",
  doors: "4",
  pricePerDay: "",
  city: "Islamabad",
  withDriver: false,
  available: true,
  images: "",
  features: "",
  description: "",
};

const ADMIN_EMAIL = "amir0315794492@gmail.com";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function statusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "CONFIRMED":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "COMPLETED":
      return "bg-muted text-foreground border-border";
    case "CANCELLED":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function messageBadgeClass(status: MessageStatus): string {
  switch (status) {
    case "NEW":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "READ":
      return "bg-primary/15 text-primary border-primary/30";
    case "RESOLVED":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function statusIcon(status: BookingStatus) {
  switch (status) {
    case "PENDING":
      return <Clock className="w-3 h-3" />;
    case "CONFIRMED":
      return <CheckCircle2 className="w-3 h-3" />;
    case "COMPLETED":
      return <CheckCircle2 className="w-3 h-3" />;
    case "CANCELLED":
      return <XCircle className="w-3 h-3" />;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CarThumb({ images, alt }: { images: string; alt: string }) {
  const urls = parseImages(images);
  const src = urls[0] || "/favicon.svg";
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = "/favicon.svg";
      }}
      className="w-16 h-12 sm:w-20 sm:h-14 rounded-md object-cover bg-muted border border-border shrink-0"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Access Denied                                                       */
/* ------------------------------------------------------------------ */

function AccessDenied() {
  const setView = useAppStore((s) => s.setView);
  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-16">
      <Card className="max-w-md w-full p-8 text-center bg-card border-border">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/15 text-red-400 grid place-items-center mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-sm mb-1">
          You need an administrator account to view this dashboard.
        </p>
        <p className="text-muted-foreground text-sm mb-6">
          Admin login:{" "}
          <span className="text-primary font-medium">{ADMIN_EMAIL}</span>
        </p>
        <Button
          onClick={() => setView("home")}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Home
        </Button>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stat Card                                                           */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  accent = "text-primary",
  iconBg = "bg-primary/15",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  accent?: string;
  iconBg?: string;
}) {
  return (
    <Card className="p-5 bg-card border-border card-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={cn("text-2xl md:text-3xl font-extrabold mt-2 truncate", accent)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
          )}
        </div>
        <div className={cn("grid place-items-center w-11 h-11 rounded-xl shrink-0", iconBg, accent)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Overview Tab                                                        */
/* ------------------------------------------------------------------ */

function OverviewTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/stats", { credentials: "include" });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok || !data.success) {
          toast.error(data.error || "Failed to load stats.");
          return;
        }
        setStats(data.stats);
      } catch {
        if (alive) toast.error("Network error loading stats.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-10 text-center bg-card border-border">
        <p className="text-muted-foreground">No stats available.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Total Revenue"
          value={formatPKR(stats.revenue)}
          subtitle="All confirmed+completed"
          accent="text-emerald-400"
          iconBg="bg-emerald-500/15"
        />
        <StatCard
          icon={CalendarCheck}
          label="Total Bookings"
          value={String(stats.totalBookings)}
          subtitle="All time"
        />
        <StatCard
          icon={CarIcon}
          label="Total Cars"
          value={String(stats.totalCars)}
          subtitle="In fleet"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={String(stats.totalUsers)}
          subtitle="Registered"
        />
      </div>

      {/* Secondary status row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Pending"
          value={String(stats.pendingBookings)}
          accent="text-amber-400"
          iconBg="bg-amber-500/15"
        />
        <StatCard
          icon={CheckCircle2}
          label="Confirmed"
          value={String(stats.confirmedBookings)}
          accent="text-emerald-400"
          iconBg="bg-emerald-500/15"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={String(stats.completedBookings)}
          accent="text-foreground"
          iconBg="bg-muted"
        />
        <StatCard
          icon={XCircle}
          label="Cancelled"
          value={String(stats.cancelledBookings)}
          accent="text-red-400"
          iconBg="bg-red-500/15"
        />
      </div>

      {/* Top Cars + Recent Bookings */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Top Cars</h3>
          </div>
          {stats.topCars.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No bookings yet.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto pr-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-right">Price/day</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topCars.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.brand} {c.model}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatPKR(c.pricePerDay)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{c._count.bookings}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <Card className="p-5 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Recent Bookings</h3>
          </div>
          {stats.recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No recent bookings.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {stats.recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background/50 border border-border"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {b.customerName || b.user?.name || "Guest"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {b.vehicle.brand} {b.vehicle.model} · {formatDate(b.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-primary">
                      {formatPKR(b.totalAmount)}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn("mt-1 gap-1", statusBadgeClass(b.status))}
                    >
                      {statusIcon(b.status)}
                      {b.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Car Form Dialog (shared add/edit)                                   */
/* ------------------------------------------------------------------ */

function CarFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Vehicle | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CarFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        const v = toVehicleWithImages(editing);
        setForm({
          brand: v.brand,
          model: v.model,
          type: v.type,
          transmission: v.transmission,
          fuel: v.fuel,
          seats: String(v.seats),
          doors: String(v.doors),
          pricePerDay: String(v.pricePerDay),
          city: v.city,
          withDriver: v.withDriver,
          available: v.available,
          images: v.images.join("\n"),
          features: v.features.join("\n"),
          description: v.description,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, editing]);

  const set = <K extends keyof CarFormState>(k: K, v: CarFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand.trim() || !form.model.trim() || !form.pricePerDay.trim()) {
      toast.error("Brand, model, and price per day are required.");
      return;
    }
    const price = Number(form.pricePerDay);
    if (isNaN(price) || price <= 0) {
      toast.error("Price per day must be a positive number.");
      return;
    }
    const seats = Number(form.seats) || 5;
    const doors = Number(form.doors) || 4;
    const images = form.images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const features = form.features
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      type: form.type,
      transmission: form.transmission,
      fuel: form.fuel,
      seats,
      doors,
      pricePerDay: price,
      city: form.city,
      withDriver: form.withDriver,
      available: form.available,
      images,
      features,
      description: form.description.trim(),
    };

    setSaving(true);
    try {
      const url = editing ? `/api/cars/${editing.id}` : "/api/cars";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || `Failed to ${editing ? "update" : "add"} car.`);
        return;
      }
      toast.success(editing ? "Car updated." : "Car added.");
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Car" : "Add New Car"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the vehicle details below."
              : "Fill in the details to add a vehicle to the fleet."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="car-brand">Brand *</Label>
              <Input
                id="car-brand"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="e.g. Toyota"
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="car-model">Model *</Label>
              <Input
                id="car-model"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                placeholder="e.g. Corolla GLi"
                maxLength={80}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {CAR_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transmission</Label>
              <Select value={form.transmission} onValueChange={(v) => set("transmission", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Transmission" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSMISSION_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuel</Label>
              <Select value={form.fuel} onValueChange={(v) => set("fuel", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Fuel" />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="car-seats">Seats</Label>
              <Input
                id="car-seats"
                type="number"
                min={1}
                max={20}
                value={form.seats}
                onChange={(e) => set("seats", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="car-doors">Doors</Label>
              <Input
                id="car-doors"
                type="number"
                min={2}
                max={6}
                value={form.doors}
                onChange={(e) => set("doors", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="car-price">Price/day *</Label>
              <Input
                id="car-price"
                type="number"
                min={0}
                value={form.pricePerDay}
                onChange={(e) => set("pricePerDay", e.target.value)}
                placeholder="Rs"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Select value={form.city} onValueChange={(v) => set("city", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {CITY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="sw-driver" className="cursor-pointer">
                  With Driver
                </Label>
                <p className="text-xs text-muted-foreground">Chauffeur available</p>
              </div>
              <Switch
                id="sw-driver"
                checked={form.withDriver}
                onCheckedChange={(v) => set("withDriver", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="sw-avail" className="cursor-pointer">
                  Available
                </Label>
                <p className="text-xs text-muted-foreground">Visible to customers</p>
              </div>
              <Switch
                id="sw-avail"
                checked={form.available}
                onCheckedChange={(v) => set("available", v)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="car-images">Image URLs (one per line)</Label>
            <Textarea
              id="car-images"
              value={form.images}
              onChange={(e) => set("images", e.target.value)}
              placeholder={"https://example.com/car1.jpg\nhttps://example.com/car2.jpg"}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="car-features">Features (one per line)</Label>
            <Textarea
              id="car-features"
              value={form.features}
              onChange={(e) => set("features", e.target.value)}
              placeholder={"AC\nBluetooth\nSunroof"}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="car-desc">Description</Label>
            <Textarea
              id="car-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Short description of the vehicle..."
              rows={3}
              maxLength={1000}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? "Save Changes" : "Add Car"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Cars Tab                                                            */
/* ------------------------------------------------------------------ */

function CarsTab() {
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/cars", { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to load cars.");
        return;
      }
      setCars(data.cars);
    } catch {
      toast.error("Network error loading cars.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (car: Vehicle) => {
    setEditing(car);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cars/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to delete car.");
        return;
      }
      toast.success("Car deleted.");
      setCars((prev) => prev.filter((c) => c.id !== deleteId));
    } catch {
      toast.error("Network error deleting car.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Fleet Management</h2>
          <p className="text-sm text-muted-foreground">
            {cars.length} vehicle{cars.length === 1 ? "" : "s"} in fleet
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Car
        </Button>
      </div>

      <Card className="bg-card border-border">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="p-10 text-center">
            <CarIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No cars yet. Add your first vehicle.</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">City</TableHead>
                  <TableHead className="text-right">Price/day</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => {
                  const v = toVehicleWithImages(car);
                  return (
                    <TableRow key={car.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <CarThumb images={car.images} alt={`${car.brand} ${car.model}`} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {car.brand} {car.model}
                            </p>
                            <p className="text-xs text-muted-foreground sm:hidden">
                              {car.type} · {car.city}
                            </p>
                            <p className="text-xs text-muted-foreground hidden sm:block">
                              {car.transmission} · {car.fuel} · {v.seats} seats
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{car.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {car.city}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatPKR(car.pricePerDay)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            car.available
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/15 text-red-400 border-red-500/30"
                          }
                        >
                          {car.available ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(car)}
                            aria-label={`Edit ${car.brand} ${car.model}`}
                            className="h-8 w-8"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog
                            open={deleteId === car.id}
                            onOpenChange={(o) => setDeleteId(o ? car.id : null)}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Delete ${car.brand} ${car.model}`}
                                className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this car?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove{" "}
                                  <span className="font-medium text-foreground">
                                    {car.brand} {car.model}
                                  </span>{" "}
                                  from the fleet. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleting}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  disabled={deleting}
                                  className="bg-red-500 text-white hover:bg-red-600 gap-2"
                                >
                                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <CarFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={load}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bookings Tab                                                        */
/* ------------------------------------------------------------------ */

function BookingsTab() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/bookings", { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to load bookings.");
        return;
      }
      setBookings(data.bookings);
    } catch {
      toast.error("Network error loading bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id: string, status: BookingStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to update booking.");
        return;
      }
      toast.success(`Booking marked ${status.toLowerCase()}.`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch {
      toast.error("Network error updating booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    if (filter === "ALL") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Booking Management</h2>
          <p className="text-sm text-muted-foreground">
            {bookings.length} total booking{bookings.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-card border-border">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarCheck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {bookings.length === 0
                ? "No bookings yet."
                : "No bookings match this filter."}
            </p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="hidden md:table-cell">Dates</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {b.customerName || b.user?.name || "Guest"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {b.customerEmail || b.user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {formatDate(b.startDate)} → {formatDate(b.endDate)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CarThumb
                          images={b.vehicle.images}
                          alt={`${b.vehicle.brand} ${b.vehicle.model}`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {b.vehicle.brand} {b.vehicle.model}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {b.vehicle.city}
                            {b.withDriver ? " · Driver" : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDate(b.startDate)}
                      <span className="mx-1">→</span>
                      {formatDate(b.endDate)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatPKR(b.totalAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn("gap-1", statusBadgeClass(b.status))}
                      >
                        {statusIcon(b.status)}
                        {b.status}
                      </Badge>
                      {b.payment && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Pay: {b.payment.status}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={b.status}
                        onValueChange={(v) => changeStatus(b.id, v as BookingStatus)}
                        disabled={updatingId === b.id}
                      >
                        <SelectTrigger className="w-36 ml-auto">
                          {updatingId === b.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Users Tab                                                           */
/* ------------------------------------------------------------------ */

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/users", { credentials: "include" });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok || !data.success) {
          toast.error(data.error || "Failed to load users.");
          return;
        }
        setUsers(data.users);
      } catch {
        if (alive) toast.error("Network error loading users.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">User Management</h2>
        <p className="text-sm text-muted-foreground">
          {users.length} registered user{users.length === 1 ? "" : "s"}
        </p>
      </div>

      <Card className="bg-card border-border">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No users found.</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border border-border">
                          <AvatarFallback className="bg-primary/15 text-primary text-xs">
                            {getInitials(u.name || u.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{u.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm">
                        <p className="flex items-center gap-1 text-muted-foreground truncate">
                          <Mail className="w-3 h-3" />
                          {u.email}
                        </p>
                        {u.phone && (
                          <p className="flex items-center gap-1 text-muted-foreground truncate">
                            <Phone className="w-3 h-3" />
                            {u.phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          u.role === "ADMIN"
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{u._count.bookings}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Messages Tab                                                        */
/* ------------------------------------------------------------------ */

function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/contact", { credentials: "include" });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok || !data.success) {
          toast.error(data.error || "Failed to load messages.");
          return;
        }
        setMessages(data.messages);
      } catch {
        if (alive) toast.error("Network error loading messages.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Support Messages</h2>
        <p className="text-sm text-muted-foreground">
          {messages.length} inquiry{messages.length === 1 ? "" : "s"} received
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <Card className="p-10 text-center bg-card border-border">
          <Inbox className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No messages yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {messages.map((m) => {
            const isOpen = expanded.has(m.id);
            const long = m.message.length > 160;
            return (
              <Card key={m.id} className="p-5 bg-card border-border card-lift flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-9 h-9 border border-border shrink-0">
                      <AvatarFallback className="bg-primary/15 text-primary text-xs">
                        {getInitials(m.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0", messageBadgeClass(m.status))}
                  >
                    {m.status}
                  </Badge>
                </div>

                <div className="text-sm font-medium text-foreground mb-1">{m.subject}</div>

                <p
                  className={cn(
                    "text-sm text-muted-foreground whitespace-pre-wrap",
                    !isOpen && long && "line-clamp-3"
                  )}
                >
                  {m.message}
                </p>
                {long && (
                  <button
                    type="button"
                    onClick={() => toggle(m.id)}
                    className="text-xs text-primary hover:underline mt-1 self-start"
                  >
                    {isOpen ? "Show less" : "Show more"}
                  </button>
                )}

                <Separator className="my-3" />

                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3 min-w-0">
                    {m.phone && (
                      <span className="flex items-center gap-1 truncate">
                        <Phone className="w-3 h-3" />
                        {m.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1 truncate">
                      <Calendar className="w-3 h-3" />
                      {formatDate(m.createdAt)}
                    </span>
                  </div>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-primary hover:underline shrink-0"
                  >
                    Reply
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main AdminView                                                      */
/* ------------------------------------------------------------------ */

export function AdminView() {
  const user = useAppStore((s) => s.user);
  const setView = useAppStore((s) => s.setView);
  const logout = useAppStore((s) => s.logout);

  if (!user || user.role !== "ADMIN") {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen animate-fade-up">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-primary/15 text-primary shrink-0">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold leading-tight">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground truncate">
                  Signed in as{" "}
                  <span className="text-primary font-medium">{user.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setView("home")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Site</span>
                <span className="sm:hidden">Site</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => logout()}
                className="gap-2 text-red-400 hover:text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto pb-2 -mx-1 px-1">
            <TabsList className="inline-flex w-max">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="cars" className="gap-2">
                <CarIcon className="w-4 h-4" />
                Cars
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <CalendarCheck className="w-4 h-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-6 focus-visible:outline-none">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="cars" className="mt-6 focus-visible:outline-none">
            <CarsTab />
          </TabsContent>
          <TabsContent value="bookings" className="mt-6 focus-visible:outline-none">
            <BookingsTab />
          </TabsContent>
          <TabsContent value="users" className="mt-6 focus-visible:outline-none">
            <UsersTab />
          </TabsContent>
          <TabsContent value="messages" className="mt-6 focus-visible:outline-none">
            <MessagesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
