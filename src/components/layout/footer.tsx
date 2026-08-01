"use client";

import { useAppStore } from "@/lib/store";
import { ShimmerLogo } from "@/components/effects/shimmer-logo";
import { Car, Mail, Phone, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "923115794492";

export function Footer() {
  const setView = useAppStore((s) => s.setView);

  const quickLinks: { label: string; view: Parameters<typeof setView> extends (v: infer V) => void ? V : never }[] = [
    { label: "Home", view: "home" },
    { label: "Browse Cars", view: "cars" },
    { label: "About Us", view: "about" },
    { label: "Contact", view: "contact" },
  ];

  const cities = ["Islamabad", "Rawalpindi", "Lahore", "Karachi", "Peshawar", "Murree"];

  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/logo.png"
                alt="RC Rentals PK logo"
                width={36}
                height={36}
                className="w-9 h-9 rounded-lg object-contain"
              />
              <ShimmerLogo className="text-lg" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pakistan&apos;s trusted car rental service for trips, tours, weddings &amp; events.
              Self-drive or with a professional chauffeur — your journey, your way.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-primary/20 text-foreground/70 hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Facebook" className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-primary/20 text-foreground/70 hover:text-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-primary/20 text-foreground/70 hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.view}>
                  <button onClick={() => setView(l.view)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">Top Cities</h3>
            <ul className="space-y-2">
              {cities.map((c) => (
                <li key={c}>
                  <button onClick={() => { useAppStore.getState().setFilters({ city: c }); setView("cars"); }} className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                    Car Rental in {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-foreground">Get in Touch</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>F-8 Markaz, Islamabad, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+923115794492" className="hover:text-primary transition-colors">+92 311 5794492</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:info@rcrentals.pk" className="hover:text-primary transition-colors">info@rcrentals.pk</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} RC Rentals PK. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with passion in Pakistan &middot; Drive with confidence
          </p>
        </div>
      </div>
    </footer>
  );
}
