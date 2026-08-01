"use client";

import { useAppStore } from "@/lib/store";
import { formatPKR, type VehicleWithImages, toVehicleWithImages, type Vehicle } from "@/lib/vehicle-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { Users, Fuel, Cog, MapPin, Star, Zap, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarCardProps {
  car: Vehicle | VehicleWithImages;
  className?: string;
}

export function CarCard({ car, className }: CarCardProps) {
  const v = "images" in car && Array.isArray(car.images) ? (car as VehicleWithImages) : toVehicleWithImages(car as Vehicle);
  const { setView, setSelectedCarId } = useAppStore();

  const openDetails = () => {
    setSelectedCarId(v.id);
    setView("car-details");
  };

  const img = v.images[0] || "/favicon.svg";

  return (
    <ScrollReveal as="article" className={cn("h-full", className)}>
    <Card className={cn("card-lift overflow-hidden group bg-card border-border flex flex-col h-full", className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted to-muted/40 grid place-items-center">
        {/* Placeholder shown behind the image (visible while loading or if it fails) */}
        <Car className="absolute w-12 h-12 text-primary/25" aria-hidden="true" />
        <img
          src={img}
          alt={`${v.brand} ${v.model} rental car in ${v.city}`}
          loading="lazy"
          className="relative w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            t.style.display = "none";
          }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground border-0">{v.type}</Badge>
          {v.withDriver && (
            <Badge variant="secondary" className="gap-1 bg-accent/20 text-accent border-accent/30">
              <Zap className="w-3 h-3" /> Driver
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="gap-1 glass">
            <Star className="w-3 h-3 fill-primary text-primary" />
            {v.rating > 0 ? v.rating.toFixed(1) : "New"}
          </Badge>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-lg leading-tight">
            {v.brand} {v.model}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {v.city}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-primary" /> {v.seats} Seater
          </span>
          <span className="flex items-center gap-1">
            <Cog className="w-3.5 h-3.5 text-primary" /> {v.transmission === "Automatic" ? "Auto" : "Manual"}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-primary" /> {v.fuel}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <span className="text-2xl font-bold text-primary">{formatPKR(v.pricePerDay)}</span>
            <span className="text-xs text-muted-foreground"> /day</span>
          </div>
          <Button size="sm" onClick={openDetails} className="bg-primary text-primary-foreground hover:bg-primary/90">
            View Details
          </Button>
        </div>
      </div>
    </Card>
    </ScrollReveal>
  );
}
