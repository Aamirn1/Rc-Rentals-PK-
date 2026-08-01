"use client";

import { ShimmerLogo } from "@/components/effects/shimmer-logo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { ShieldCheck, Wallet, Clock, Headset, Car, MapPin, Target, Heart, Users, Award, TrendingUp, Sparkles } from "lucide-react";

const VALUES = [
  { icon: ShieldCheck, title: "Safety First", desc: "Every vehicle is inspected and sanitized. Verified, licensed drivers available on request." },
  { icon: Wallet, title: "Transparent Pricing", desc: "No hidden charges. What you see is what you pay — the best rates in Pakistan." },
  { icon: Clock, title: "24/7 Availability", desc: "Book anytime, day or night. Our support team and fleet are always ready." },
  { icon: Heart, title: "Customer Obsessed", desc: "Thousands of happy travelers trust RC Rentals PK for their journeys." },
];

const STATS = [
  { icon: Car, value: "500+", label: "Vehicles in Fleet" },
  { icon: MapPin, value: "10+", label: "Cities Covered" },
  { icon: Users, value: "10,000+", label: "Happy Customers" },
  { icon: Award, value: "4.8★", label: "Average Rating" },
];

const TEAM = [
  { name: "Amir Khan", role: "Founder & CEO", initials: "AK" },
  { name: "Sana Malik", role: "Operations Head", initials: "SM" },
  { name: "Bilal Ahmed", role: "Fleet Manager", initials: "BA" },
  { name: "Ayesha Tariq", role: "Customer Success", initials: "AT" },
];

export function AboutView() {
  const setView = useAppStore((s) => s.setView);

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <Badge variant="secondary" className="mb-4 gap-1 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3" /> Our Story
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5">
            Driving Pakistan <span className="text-gradient-gold">Forward</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            RC Rentals PK was founded with a simple mission: make car rental in Pakistan effortless,
            affordable, and trustworthy. From the streets of Islamabad to the peaks of Murree, we&apos;re
            here to get you there.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">Our Mission</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Empowering every journey with freedom &amp; reliability</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We believe everyone deserves to travel on their own terms. Whether it&apos;s a family trip to
              the northern areas, a business meeting in Lahore, or your wedding day in Karachi — RC Rentals PK
              gives you the keys to make it happen.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our fleet spans economical hatchbacks to luxury sedans and SUVs, available self-drive or with
              professional chauffeurs. We combine transparent pricing, a meticulously maintained fleet, and
              round-the-clock support to deliver Pakistan&apos;s most dependable rental experience.
            </p>
          </div>
          <Card className="glass p-8">
            <ShimmerLogo className="text-3xl mb-6 block" />
            <div className="space-y-4">
              {[
                "Hand-picked, regularly serviced vehicles",
                "Professional, background-verified drivers",
                "Simple online booking in under 2 minutes",
                "Flexible self-drive & chauffeur options",
                "Dedicated 24/7 roadside assistance",
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 grid place-items-center w-5 h-5 rounded-full bg-primary/20 text-primary shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-sm text-foreground/90">{point}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="grid place-items-center w-12 h-12 rounded-xl bg-primary/15 text-primary mx-auto mb-3">
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-gradient-gold">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Choose RC Rentals PK?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four pillars that define how we serve thousands of travelers every month.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((v, i) => (
            <Card key={i} className="card-lift p-6 bg-card border-border text-center">
              <div className="grid place-items-center w-14 h-14 rounded-2xl bg-primary/15 text-primary mx-auto mb-4">
                <v.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Meet the Team</h2>
          <p className="text-muted-foreground">The people behind your smooth rides.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((m, i) => (
            <Card key={i} className="card-lift p-6 text-center bg-card border-border">
              <div className="grid place-items-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 text-primary font-bold text-xl mx-auto mb-4 border border-primary/20">
                {m.initials}
              </div>
              <h3 className="font-semibold">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.role}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <Card className="glass p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
          <div className="relative">
            <TrendingUp className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to hit the road?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Join thousands of satisfied customers who travel with RC Rentals PK. Book your car today.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => setView("cars")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Browse Cars
              </Button>
              <Button size="lg" variant="outline" onClick={() => setView("contact")}>
                Contact Us
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
