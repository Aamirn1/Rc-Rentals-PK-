"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  ShieldCheck,
  Wallet,
  Clock,
  Headset,
  Search,
  CalendarCheck,
  Car,
  Star,
  ArrowRight,
  Sparkles,
  TrendingUp,
  MapPin,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAppStore, PAKISTAN_CITIES, CAR_TYPES } from "@/lib/store";
import { toVehicleWithImages, formatPKR, type Vehicle } from "@/lib/vehicle-utils";
import { ShimmerLogo } from "@/components/effects/shimmer-logo";
import { Typewriter } from "@/components/effects/typewriter";
import { CarCard } from "@/components/cars/car-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Hero3DScene = dynamic(
  () => import("@/components/effects/hero-3d-scene").then((m) => m.Hero3DScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full grid place-items-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    ),
  }
);

const BRANDS = [
  "Toyota",
  "Honda",
  "Suzuki",
  "Mercedes-Benz",
  "BMW",
  "Kia",
  "Hyundai",
  "Porsche",
  "Ford",
  "Audi",
];

const WHY_US = [
  {
    icon: ShieldCheck,
    title: "Verified Drivers",
    desc: "Every chauffeur is background-checked, licensed, and trained for safe, comfortable rides.",
  },
  {
    icon: Wallet,
    title: "Best Prices",
    desc: "Transparent, all-inclusive pricing. No hidden fees, no surprises at pickup — ever.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    desc: "Round-the-clock roadside assistance and a real human one call away, anywhere in Pakistan.",
  },
  {
    icon: Headset,
    title: "Instant Booking",
    desc: "Book your car in under two minutes. Confirm in seconds, pick up at your convenience.",
  },
];

const STEPS = [
  {
    icon: Search,
    title: "Search",
    desc: "Browse our fleet of 500+ cars by city, type, and price to find your perfect ride.",
  },
  {
    icon: CalendarCheck,
    title: "Book",
    desc: "Pick your dates, choose self-drive or chauffeur, and confirm your booking instantly.",
  },
  {
    icon: Car,
    title: "Drive",
    desc: "Pick up your car, hit the road, and enjoy the journey. We handle the rest.",
  },
];

const STATS = [
  { value: "500+", label: "Cars in Fleet" },
  { value: "10+", label: "Cities Covered" },
  { value: "10k+", label: "Happy Customers" },
  { value: "4.8", label: "Average Rating" },
];

const TESTIMONIALS = [
  {
    name: "Hassan Raza",
    initials: "HR",
    role: "Business Traveler, Islamabad",
    rating: 5,
    quote:
      "Booked a Mercedes E-Class for an airport transfer. Spotless car, professional driver, and on-time pickup. RC Rentals PK is now my go-to.",
  },
  {
    name: "Fatima Khan",
    initials: "FK",
    role: "Family Trip, Lahore",
    rating: 5,
    quote:
      "Rented a Kia Sportage for a week-long family trip to Murree. The booking was instant and the car was in excellent condition. Highly recommended!",
  },
  {
    name: "Bilal Ahmed",
    initials: "BA",
    role: "Adventure Seeker, Karachi",
    rating: 4,
    quote:
      "Great variety of cars at honest prices. The 24/7 support team answered all my questions at midnight. Will definitely rent again.",
  },
];

interface CityData {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
}

export function HomeView() {
  const { setView, setFilters, filters } = useAppStore();

  // Search bar local state (synced from store so other views can pre-fill)
  const [city, setCity] = useState(filters.city);
  const [type, setType] = useState(filters.type);
  const [withDriver, setWithDriver] = useState(filters.withDriver);

  useEffect(() => {
    setCity(filters.city);
    setType(filters.type);
    setWithDriver(filters.withDriver);
  }, [filters.city, filters.type, filters.withDriver]);

  const [featured, setFeatured] = useState<Vehicle[] | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [cities, setCities] = useState<CityData[] | null>(null);
  const [citiesLoading, setCitiesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setFeaturedLoading(true);
      try {
        const res = await fetch("/api/cars?sort=featured");
        const data = await res.json();
        if (!active) return;
        if (!res.ok || !data.success) throw new Error("fetch failed");
        setFeatured((data.cars as Vehicle[]).slice(0, 6));
      } catch {
        if (active) toast.error("Failed to load featured cars.");
      } finally {
        if (active) setFeaturedLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setCitiesLoading(true);
      try {
        const res = await fetch("/api/cities");
        const data = await res.json();
        if (!active) return;
        if (!res.ok || !data.success) throw new Error("fetch failed");
        setCities(data.cities as CityData[]);
      } catch {
        if (active) toast.error("Failed to load cities.");
      } finally {
        if (active) setCitiesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ city, type, withDriver });
    setView("cars");
  };

  const goToCity = (cityName: string) => {
    setFilters({ city: cityName });
    setView("cars");
  };

  return (
    <div className="animate-fade-up">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-24 md:pt-16 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left */}
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-5 gap-1 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-3 h-3" /> Pakistan&apos;s Premium Car Rental
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
                <span className="block text-foreground">
                  <Typewriter
                    phrases={[
                      "Rent Your Dream Car",
                      "Drive Anywhere in Pakistan",
                      "Self-Drive or Chauffeur",
                      "Book in Minutes",
                    ]}
                  />
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
                From economical hatchbacks to luxury sedans and SUVs — RC Rentals PK gives you the
                keys to explore Pakistan. Self-drive or with a professional chauffeur, in 10+ cities.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => setView("cars")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-7"
                >
                  Browse Cars <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setView("cars")}
                  className="h-12 px-7"
                >
                  Book Now
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Verified Drivers
                </span>
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-primary" /> Best Prices
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" /> 24/7 Support
                </span>
              </div>
            </div>

            {/* Right — 3D scene */}
            <div className="relative animate-float">
              <div className="glass rounded-3xl p-4 sm:p-6 aspect-square max-w-md mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
                <div className="w-full h-full relative">
                  <Hero3DScene />
                </div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full text-xs text-muted-foreground flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-primary" /> Powered by RC Rentals PK
              </div>
            </div>
          </div>
        </div>

        {/* ===== SEARCH BAR (glass, overlapping hero bottom) ===== */}
        <div className="relative z-10 -mt-12 md:-mt-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Card className="glass p-4 md:p-6 shadow-2xl">
              <form
                onSubmit={submitSearch}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto_auto] gap-3 md:gap-4 items-end"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="hero-city" className="text-xs text-muted-foreground">
                    City
                  </Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger id="hero-city" className="w-full h-11" aria-label="Select city">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAKISTAN_CITIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hero-type" className="text-xs text-muted-foreground">
                    Car Type
                  </Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="hero-type" className="w-full h-11" aria-label="Select car type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAR_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 h-11 px-3 rounded-md border border-border bg-background/40">
                  <Switch
                    id="hero-driver"
                    checked={withDriver}
                    onCheckedChange={setWithDriver}
                    aria-label="With driver toggle"
                  />
                  <Label htmlFor="hero-driver" className="text-sm cursor-pointer">
                    With Driver
                  </Label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <Search className="w-4 h-4" /> Search
                </Button>

                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-11 px-6"
                  onClick={() => setView("cars")}
                >
                  All Filters
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== BRAND MARQUEE ===== */}
      <section className="py-8 border-y border-border bg-card/30 mt-6">
        <div className="overflow-hidden">
          <div className="flex animate-marquee gap-12 whitespace-nowrap items-center">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <span
                key={i}
                className="text-xl md:text-2xl font-bold text-muted-foreground/70 hover:text-primary transition-colors"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED CARS ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="secondary" className="mb-3 bg-accent/10 text-accent border-accent/20 gap-1">
              <Star className="w-3 h-3 fill-accent text-accent" /> Top Picks
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Featured Vehicles</h2>
            <p className="text-muted-foreground mt-1">Hand-picked rides from our premium fleet.</p>
          </div>
          <Button variant="outline" onClick={() => setView("cars")} className="gap-2">
            View All Cars <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden bg-card border-border">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((car) => (
              <CarCard key={car.id} car={toVehicleWithImages(car)} />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center bg-card border-border">
            <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No cars available right now. Please check back soon.</p>
          </Card>
        )}
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-primary/20 gap-1">
              <ShieldCheck className="w-3 h-3" /> Why RC Rentals PK
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Choose Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four pillars that make us Pakistan&apos;s most trusted car rental platform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((w, i) => (
              <Card key={i} className="card-lift p-6 bg-card border-border text-center">
                <div className="grid place-items-center w-14 h-14 rounded-2xl bg-primary/15 text-primary mx-auto mb-4">
                  <w.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POPULAR CITIES ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 bg-accent/10 text-accent border-accent/20 gap-1">
            <MapPin className="w-3 h-3" /> Across Pakistan
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Popular Cities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Rent a car in major cities and tourist destinations across Pakistan.
          </p>
        </div>

        {citiesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
            ))}
          </div>
        ) : cities && cities.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {cities.map((c) => (
              <button
                key={c.id}
                onClick={() => goToCity(c.name)}
                className="group text-left"
                aria-label={`Rent a car in ${c.name}`}
              >
                <Card className="card-lift overflow-hidden bg-card border-border h-full">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={c.image || "/favicon.svg"}
                      alt={`Rent a car in ${c.name}, Pakistan`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/favicon.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary" /> {c.name}
                      </h3>
                      <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1 group-hover:text-primary transition-colors">
                        Rent a Car in {c.name} <ArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center bg-card border-border">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Cities coming soon.</p>
          </Card>
        )}
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-primary/20 gap-1">
              <CalendarCheck className="w-3 h-3" /> Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Renting a car with RC Rentals PK takes just three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {STEPS.map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="relative mx-auto mb-5 w-fit">
                  <div className="grid place-items-center w-16 h-16 rounded-2xl bg-primary/15 text-primary">
                    <s.icon className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 grid place-items-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold border-2 border-background">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS BAND ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-gradient-gold">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3 bg-accent/10 text-accent border-accent/20 gap-1">
              <Star className="w-3 h-3 fill-accent text-accent" /> Customer Love
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">What Our Customers Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Thousands of travelers trust RC Rentals PK for their journeys across Pakistan.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="card-lift p-6 bg-card border-border flex flex-col">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={
                        j < t.rating
                          ? "w-4 h-4 fill-primary text-primary"
                          : "w-4 h-4 text-muted-foreground/40"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-5 flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 text-primary font-bold text-sm border border-primary/20">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <Card className="glass p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
          <div className="relative">
            <TrendingUp className="w-10 h-10 text-primary mx-auto mb-4" />
            <ShimmerLogo className="text-2xl mb-4 block" />
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to hit the road?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Join thousands of satisfied customers who travel with RC Rentals PK. Book your car in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                onClick={() => setView("cars")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-7"
              >
                Browse Cars <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setView("contact")} className="h-12 px-7">
                Contact Us
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Prices starting from {formatPKR(4500)}/day · Free cancellation · No hidden fees
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
