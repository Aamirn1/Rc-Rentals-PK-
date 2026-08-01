"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Users,
  Fuel,
  Cog,
  MapPin,
  Zap,
  DoorOpen,
  CalendarDays,
  Car as CarIcon,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  Clock,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  toVehicleWithImages,
  formatPKR,
  daysBetween,
  formatDate,
  type Vehicle,
  type VehicleWithImages,
} from "@/lib/vehicle-utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const DRIVER_FEE_PER_DAY = 2500;

interface Review {
  id: string;
  userId: string;
  vehicleId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string } | null;
}

interface CarWithReviews extends Vehicle {
  reviews?: Review[];
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDaysISO(base: string, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function CarDetailsView() {
  const { selectedCarId, setView, setBookingDraft, user } = useAppStore();

  const [car, setCar] = useState<VehicleWithImages | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  // Booking widget state
  const today = todayISO();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDaysISO(today, 1));
  const [withDriver, setWithDriver] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");

  // Review form state
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!selectedCarId) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cars/${selectedCarId}`);
        const data = await res.json();
        if (!active) return;
        if (!res.ok || !data.success || !data.car) {
          toast.error(data.error || "Car not found.");
          setCar(null);
          return;
        }
        const c = toVehicleWithImages(data.car as CarWithReviews);
        setCar(c);
        setReviews((data.car as CarWithReviews).reviews ?? []);
        setWithDriver(!!(data.car as CarWithReviews).withDriver);
        setActiveImg(0);
        setPickupLocation((data.car as CarWithReviews).city || "");
      } catch {
        if (active) {
          toast.error("Failed to load car details.");
          setCar(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedCarId]);

  // Fetch fresh reviews list separately so submission reflects instantly
  const refreshReviews = async () => {
    if (!selectedCarId) return;
    try {
      const res = await fetch(`/api/reviews?vehicleId=${selectedCarId}`);
      const data = await res.json();
      if (res.ok && data.success) setReviews(data.reviews as Review[]);
    } catch {
      /* ignore */
    }
  };

  const days = useMemo(() => daysBetween(startDate, endDate), [startDate, endDate]);
  const driverFee = withDriver ? DRIVER_FEE_PER_DAY * days : 0;
  const total = car ? car.pricePerDay * days + driverFee : 0;

  const handleBook = () => {
    if (!car) return;
    if (!startDate || !endDate) {
      toast.error("Please select booking dates.");
      return;
    }
    if (days < 1) {
      toast.error("End date must be after the start date.");
      return;
    }
    if (!pickupLocation.trim()) {
      toast.error("Please enter a pickup location.");
      return;
    }
    if (!user) {
      toast.error("Please login to book this car.");
      setView("login");
      return;
    }
    setBookingDraft({
      vehicleId: car.id,
      vehicleName: `${car.brand} ${car.model}`,
      startDate,
      endDate,
      withDriver,
      pickupLocation: pickupLocation.trim(),
    });
    setView("booking");
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;
    if (!user) {
      toast.error("Please login to leave a review.");
      setView("login");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a short comment.");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: car.id,
          rating: Number(reviewRating),
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to submit review.");
        return;
      }
      toast.success("Review submitted. Thank you!");
      setReviewComment("");
      setReviewRating("5");
      await refreshReviews();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ===== No car selected =====
  if (!selectedCarId && !loading) {
    return (
      <div className="animate-fade-up mx-auto max-w-3xl px-4 py-20 text-center">
        <Card className="p-10 md:p-14 bg-card border-border">
          <div className="grid place-items-center w-16 h-16 rounded-full bg-primary/15 text-primary mx-auto mb-4">
            <CarIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No car selected</h2>
          <p className="text-muted-foreground mb-6">
            Browse our fleet and pick a car to view full details, pricing, and booking options.
          </p>
          <Button
            onClick={() => setView("cars")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <CarIcon className="w-4 h-4" /> Browse Cars
          </Button>
        </Card>
      </div>
    );
  }

  // ===== Loading =====
  if (loading) {
    return (
      <div className="animate-fade-up mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-24 h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-32 rounded-lg" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ===== Car not found =====
  if (!car) {
    return (
      <div className="animate-fade-up mx-auto max-w-3xl px-4 py-20 text-center">
        <Card className="p-10 md:p-14 bg-card border-border">
          <div className="grid place-items-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
            <CarIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Car not found</h2>
          <p className="text-muted-foreground mb-6">
            The car you&apos;re looking for is no longer available. Please browse our fleet.
          </p>
          <Button
            onClick={() => setView("cars")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <CarIcon className="w-4 h-4" /> Browse Cars
          </Button>
        </Card>
      </div>
    );
  }

  const mainImage = car.images[activeImg] || car.images[0] || "/favicon.svg";
  const avgRating = car.rating || 0;
  const driverRequired = !!car.withDriver;

  const specs = [
    { icon: Users, label: "Seats", value: `${car.seats}` },
    { icon: DoorOpen, label: "Doors", value: `${car.doors}` },
    { icon: Cog, label: "Transmission", value: car.transmission },
    { icon: Fuel, label: "Fuel", value: car.fuel },
  ];

  const trust = [
    { icon: ShieldCheck, label: "Verified & Inspected" },
    { icon: Wallet, label: "No Hidden Charges" },
    { icon: Clock, label: "24/7 Support" },
  ];

  return (
    <div className="animate-fade-up mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => setView("cars")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all cars
      </button>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        {/* ===== LEFT: gallery + info ===== */}
        <div className="space-y-6">
          {/* Gallery */}
          <Card className="overflow-hidden bg-card border-border">
            <div className="relative aspect-[16/10] bg-muted">
              <img
                src={mainImage}
                alt={`${car.brand} ${car.model} - view ${activeImg + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/favicon.svg";
                }}
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground border-0">{car.type}</Badge>
                {car.withDriver && (
                  <Badge variant="secondary" className="gap-1 bg-accent/20 text-accent border-accent/30">
                    <Zap className="w-3 h-3" /> Driver Included
                  </Badge>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="gap-1 glass">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  {avgRating > 0 ? avgRating.toFixed(1) : "New"}
                </Badge>
              </div>
            </div>

            {/* Thumbnails */}
            {car.images.length > 1 && (
              <div className="p-3 flex gap-3 overflow-x-auto no-scrollbar">
                {car.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImg
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={i === activeImg}
                  >
                    <img
                      src={img}
                      alt={`${car.brand} ${car.model} thumbnail ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/favicon.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Title + meta */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                  {car.brand} <span className="text-gradient-gold">{car.model}</span>
                </h1>
                <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-primary" /> Available in {car.city}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-primary">
                  {formatPKR(car.pricePerDay)}
                </div>
                <div className="text-xs text-muted-foreground">per day</div>
              </div>
            </div>

            {/* Rating stars */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < Math.round(avgRating)
                          ? "w-4 h-4 fill-primary text-primary"
                          : "w-4 h-4 text-muted-foreground/40"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {avgRating.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              </div>
            )}
          </div>

          {/* Specs grid */}
          <Card className="p-5 bg-card border-border">
            <h2 className="font-semibold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {specs.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-3 rounded-lg bg-background/40 border border-border"
                >
                  <s.icon className="w-5 h-5 text-primary mb-1.5" />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="font-semibold text-sm mt-0.5">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Description */}
          <Card className="p-5 bg-card border-border">
            <h2 className="font-semibold mb-3">About this car</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{car.description}</p>
          </Card>

          {/* Features */}
          {car.features.length > 0 && (
            <Card className="p-5 bg-card border-border">
              <h2 className="font-semibold mb-4">Features &amp; Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {car.features.map((f, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-background/60 text-foreground border-border gap-1 py-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-accent" /> {f}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Trust badges */}
          <div className="grid sm:grid-cols-3 gap-3">
            {trust.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border"
              >
                <div className="grid place-items-center w-9 h-9 rounded-lg bg-primary/15 text-primary shrink-0">
                  <t.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">{t.label}</span>
              </div>
            ))}
          </div>

          {/* ===== Reviews section ===== */}
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> Customer Reviews
              </h2>
              {reviews.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="flex gap-3 p-3 rounded-lg bg-background/40 border border-border"
                  >
                    <Avatar className="w-9 h-9 border border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/20 text-primary text-xs font-bold">
                        {(r.user?.name || "A").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">{r.user?.name || "Anonymous"}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(r.createdAt)}
                        </span>
                      </div>
                      <div className="flex gap-0.5 my-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={
                              j < r.rating
                                ? "w-3 h-3 fill-primary text-primary"
                                : "w-3 h-3 text-muted-foreground/40"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No reviews yet. Be the first to share your experience!
              </p>
            )}

            {/* Review form */}
            {user ? (
              <form onSubmit={submitReview} className="mt-5 pt-5 border-t border-border space-y-3">
                <h3 className="font-semibold text-sm">Write a Review</h3>
                <div className="grid sm:grid-cols-[140px_1fr] gap-3 items-end">
                  <div className="space-y-1.5">
                    <Label htmlFor="review-rating" className="text-xs text-muted-foreground">
                      Rating
                    </Label>
                    <Select value={reviewRating} onValueChange={setReviewRating}>
                      <SelectTrigger id="review-rating" className="h-10 w-full" aria-label="Select rating">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {"★".repeat(n)} ({n}/5)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="review-comment" className="sr-only">
                      Your review
                    </Label>
                    <Textarea
                      id="review-comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this car..."
                      rows={3}
                      maxLength={1000}
                      className="resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" /> Submit Review
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-5 pt-5 border-t border-border text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => setView("login")}
                  >
                    Login
                  </Button>{" "}
                  to write a review.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* ===== RIGHT: booking widget (sticky) ===== */}
        <aside>
          <div className="sticky top-20">
            <Card className="p-6 bg-card border-border shadow-xl">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-lg">Book this Car</h2>
                <Badge variant="secondary" className="glass gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  {avgRating > 0 ? avgRating.toFixed(1) : "New"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-5">
                {car.brand} {car.model} · {car.city}
              </p>

              <div className="space-y-4">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="start-date" className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> Pickup
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="end-date" className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> Return
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      min={startDate || today}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* With Driver */}
                <div
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-border ${
                    driverRequired ? "bg-accent/10" : "bg-background/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="with-driver"
                      checked={withDriver}
                      disabled={driverRequired}
                      onCheckedChange={(v) => setWithDriver(v === true)}
                      aria-label="Add professional driver"
                    />
                    <Label htmlFor="with-driver" className="text-sm cursor-pointer flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-accent" /> With Driver
                      <span className="text-xs text-muted-foreground">(+{formatPKR(DRIVER_FEE_PER_DAY)}/day)</span>
                    </Label>
                  </div>
                  {driverRequired && (
                    <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 text-[10px]">
                      Required
                    </Badge>
                  )}
                </div>

                {/* Pickup location */}
                <div className="space-y-1.5">
                  <Label htmlFor="pickup" className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Pickup Location
                  </Label>
                  <Input
                    id="pickup"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Islamabad Airport, F-8 Markaz..."
                    className="h-10"
                    maxLength={200}
                  />
                </div>

                {/* Price breakdown */}
                <div className="rounded-lg bg-background/40 border border-border p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {formatPKR(car.pricePerDay)} × {days} day{days === 1 ? "" : "s"}
                    </span>
                    <span className="font-medium">{formatPKR(car.pricePerDay * days)}</span>
                  </div>
                  {withDriver && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Driver fee × {days} day{days === 1 ? "" : "s"}
                      </span>
                      <span className="font-medium">{formatPKR(driverFee)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-extrabold text-primary">{formatPKR(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleBook}
                  size="lg"
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <CalendarDays className="w-4 h-4" /> Book Now
                </Button>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  Free cancellation up to 24 hours before pickup. No payment required now — pay at pickup.
                </p>

                {!user && (
                  <p className="text-xs text-center text-accent">
                    You&apos;ll need to{" "}
                    <button
                      onClick={() => setView("login")}
                      className="underline underline-offset-2 hover:text-primary"
                    >
                      login
                    </button>{" "}
                    to complete booking.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </aside>
      </div>

      {/* ===== Similar / back to cars ===== */}
      <section className="mt-12 text-center">
        <Button variant="outline" onClick={() => setView("cars")} className="gap-2">
          <CarIcon className="w-4 h-4" /> Browse More Cars
        </Button>
      </section>
    </div>
  );
}
