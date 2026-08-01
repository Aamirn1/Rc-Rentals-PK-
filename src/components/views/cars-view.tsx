"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  X,
  Car as CarIcon,
  RotateCcw,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useAppStore, PAKISTAN_CITIES, CAR_TYPES } from "@/lib/store";
import { toVehicleWithImages, formatPKR, type Vehicle } from "@/lib/vehicle-utils";
import { CarCard } from "@/components/cars/car-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

const TRANSMISSIONS = ["All", "Automatic", "Manual"];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];
const PRICE_MAX = 50000;

export function CarsView() {
  const { filters, setFilters, resetFilters } = useAppStore();

  const [cars, setCars] = useState<Vehicle[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Debounce the free-text query so typing doesn't hammer the API
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(filters.query), 350);
    return () => clearTimeout(t);
  }, [filters.query]);

  // Re-fetch whenever any filter changes (query is debounced)
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          city: filters.city,
          type: filters.type,
          transmission: filters.transmission,
          withDriver: String(filters.withDriver),
          minPrice: String(filters.minPrice),
          maxPrice: String(filters.maxPrice),
          sort: filters.sort,
          query: debouncedQuery,
        });
        const res = await fetch(`/api/cars?${params.toString()}`);
        const data = await res.json();
        if (!active) return;
        if (!res.ok || !data.success) throw new Error("fetch failed");
        setCars(data.cars as Vehicle[]);
      } catch {
        if (active) {
          toast.error("Failed to load cars. Please try again.");
          setCars([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [
    filters.city,
    filters.type,
    filters.transmission,
    filters.withDriver,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    debouncedQuery,
  ]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.city !== "All") n++;
    if (filters.type !== "All") n++;
    if (filters.transmission !== "All") n++;
    if (filters.withDriver) n++;
    if (filters.query.trim()) n++;
    if (filters.maxPrice < PRICE_MAX) n++;
    if (filters.sort !== "featured") n++;
    return n;
  }, [filters]);

  const FiltersPanel = (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="filter-query" className="text-sm font-medium">
          Search
        </Label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="filter-query"
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
            placeholder="Brand or model..."
            className="pl-9 h-10"
            aria-label="Search cars by brand or model"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => setFilters({ query: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="filter-city" className="text-sm font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" /> City
        </Label>
        <Select value={filters.city} onValueChange={(v) => setFilters({ city: v })}>
          <SelectTrigger id="filter-city" className="w-full h-10" aria-label="Filter by city">
            <SelectValue placeholder="All cities" />
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

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="filter-type" className="text-sm font-medium">
          Car Type
        </Label>
        <Select value={filters.type} onValueChange={(v) => setFilters({ type: v })}>
          <SelectTrigger id="filter-type" className="w-full h-10" aria-label="Filter by car type">
            <SelectValue placeholder="All types" />
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

      {/* Transmission */}
      <div className="space-y-2">
        <Label htmlFor="filter-transmission" className="text-sm font-medium">
          Transmission
        </Label>
        <Select
          value={filters.transmission}
          onValueChange={(v) => setFilters({ transmission: v })}
        >
          <SelectTrigger
            id="filter-transmission"
            className="w-full h-10"
            aria-label="Filter by transmission"
          >
            <SelectValue placeholder="Any transmission" />
          </SelectTrigger>
          <SelectContent>
            {TRANSMISSIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="filter-price" className="text-sm font-medium">
            Max Price / day
          </Label>
          <span className="text-sm font-semibold text-primary">
            {formatPKR(filters.maxPrice)}
          </span>
        </div>
        <Slider
          id="filter-price"
          min={0}
          max={PRICE_MAX}
          step={500}
          value={[filters.maxPrice]}
          onValueChange={(v) => setFilters({ maxPrice: v[0] ?? PRICE_MAX })}
          aria-label="Maximum price per day"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatPKR(0)}</span>
          <span>{formatPKR(PRICE_MAX)}+</span>
        </div>
      </div>

      {/* With Driver */}
      <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-md border border-border bg-background/40">
        <Label htmlFor="filter-driver" className="text-sm font-medium cursor-pointer">
          With Driver
        </Label>
        <Switch
          id="filter-driver"
          checked={filters.withDriver}
          onCheckedChange={(v) => setFilters({ withDriver: v })}
          aria-label="Show only cars with driver"
        />
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label htmlFor="filter-sort" className="text-sm font-medium">
          Sort By
        </Label>
        <Select value={filters.sort} onValueChange={(v) => setFilters({ sort: v })}>
          <SelectTrigger id="filter-sort" className="w-full h-10" aria-label="Sort results">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset */}
      <Button
        variant="outline"
        className="w-full h-10 gap-2"
        onClick={() => resetFilters()}
      >
        <RotateCcw className="w-4 h-4" /> Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="animate-fade-up">
      {/* Page header */}
      <section className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-primary/20 gap-1">
            <CarIcon className="w-3 h-3" /> Our Fleet
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">Available Cars</h1>
          <p className="text-muted-foreground mt-1">
            Browse our fleet of premium vehicles. Filter by city, type, transmission, and price.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold">Filters</h2>
                  {activeFilterCount > 0 && (
                    <Badge className="ml-auto bg-primary text-primary-foreground">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
                {FiltersPanel}
              </Card>
            </div>
          </aside>

          {/* Main area */}
          <div>
            {/* Toolbar (mobile filter button + count + sort) */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden gap-2 h-10">
                      <SlidersHorizontal className="w-4 h-4" /> Filters
                      {activeFilterCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground ml-1">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85%] sm:max-w-sm overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
                      </SheetTitle>
                    </SheetHeader>
                    <div className="px-4 pb-6">{FiltersPanel}</div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {loading ? (
                    "Loading..."
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">
                        {cars?.length ?? 0}
                      </span>{" "}
                      car{(cars?.length ?? 0) === 1 ? "" : "s"} found
                    </>
                  )}
                </p>
              </div>

              {/* Mobile sort */}
              <div className="lg:hidden">
                <Select value={filters.sort} onValueChange={(v) => setFilters({ sort: v })}>
                  <SelectTrigger className="h-10 w-[180px]" aria-label="Sort results">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Desktop sort row */}
            <div className="hidden lg:flex items-center justify-end mb-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="sort-desktop" className="text-sm text-muted-foreground">
                  Sort:
                </Label>
                <Select value={filters.sort} onValueChange={(v) => setFilters({ sort: v })}>
                  <SelectTrigger id="sort-desktop" className="h-9 w-[200px]" aria-label="Sort results">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.city !== "All" && (
                  <FilterChip label={`City: ${filters.city}`} onClear={() => setFilters({ city: "All" })} />
                )}
                {filters.type !== "All" && (
                  <FilterChip label={`Type: ${filters.type}`} onClear={() => setFilters({ type: "All" })} />
                )}
                {filters.transmission !== "All" && (
                  <FilterChip
                    label={`Transmission: ${filters.transmission}`}
                    onClear={() => setFilters({ transmission: "All" })}
                  />
                )}
                {filters.withDriver && (
                  <FilterChip label="With Driver" onClear={() => setFilters({ withDriver: false })} />
                )}
                {filters.query.trim() && (
                  <FilterChip
                    label={`"${filters.query}"`}
                    onClear={() => setFilters({ query: "" })}
                  />
                )}
                {filters.maxPrice < PRICE_MAX && (
                  <FilterChip
                    label={`Up to ${formatPKR(filters.maxPrice)}`}
                    onClear={() => setFilters({ maxPrice: PRICE_MAX })}
                  />
                )}
                <button
                  onClick={() => resetFilters()}
                  className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2 ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
            ) : cars && cars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <CarCard key={car.id} car={toVehicleWithImages(car)} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-card border-border">
                <div className="grid place-items-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
                  <CarIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No cars found</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Try adjusting your filters or broadening your search.
                </p>
                <Button onClick={() => resetFilters()} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Reset Filters
                </Button>
              </Card>
            )}

            {/* Back to top hint when long list */}
            {cars && cars.length > 9 && (
              <div className="mt-8 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="gap-1"
                >
                  Back to top <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs">
      {label}
      <button
        type="button"
        onClick={onClear}
        className="hover:text-primary/70"
        aria-label={`Remove filter ${label}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
