"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ShimmerLogo } from "@/components/effects/shimmer-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Car, LogOut, LayoutDashboard, User as UserIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { label: string; view: Parameters<typeof useAppStore.getState>["setView"] extends (v: infer V) => void ? V : never }[] = [
  { label: "Home", view: "home" },
  { label: "Cars", view: "cars" },
  { label: "About", view: "about" },
  { label: "Contact", view: "contact" },
];

export function Navbar() {
  const { view, setView, user, logout } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (v: typeof view) => {
    setView(v);
    setOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button onClick={() => go("home")} className="flex items-center gap-2 group" aria-label="RC Rentals PK home">
          <img
            src="/logo.png"
            alt="RC Rentals PK logo"
            width={36}
            height={36}
            className="w-9 h-9 rounded-lg object-cover transition-transform group-hover:scale-110"
          />
          <ShimmerLogo className="text-lg sm:text-xl" />
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              onClick={() => go(item.view)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                view === item.view
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-foreground hover:bg-white/5"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => go("profile")} className="gap-2">
                <UserIcon className="w-4 h-4" />
                {user.name.split(" ")[0]}
              </Button>
              {user.role === "ADMIN" && (
                <Button variant="ghost" size="sm" onClick={() => go("admin")} className="gap-2 text-accent">
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => go("login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => go("signup")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-card border-l-border p-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <ShimmerLogo className="text-base" />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-col p-4 gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.view}
                  onClick={() => go(item.view)}
                  className={cn(
                    "text-left px-4 py-3 rounded-md text-sm font-medium transition-colors",
                    view === item.view ? "text-primary bg-primary/10" : "text-foreground/80 hover:bg-white/5"
                  )}
                >
                  {item.label}
                </button>
              ))}
              <div className="h-px bg-border my-2" />
              {user ? (
                <>
                  <Button variant="ghost" className="justify-start gap-2" onClick={() => go("profile")}>
                    <UserIcon className="w-4 h-4" /> My Profile
                  </Button>
                  {user.role === "ADMIN" && (
                    <Button variant="ghost" className="justify-start gap-2 text-accent" onClick={() => go("admin")}>
                      <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                    </Button>
                  )}
                  <Button variant="outline" className="justify-start gap-2" onClick={logout}>
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="justify-start" onClick={() => go("login")}>
                    Login
                  </Button>
                  <Button className="justify-start bg-primary text-primary-foreground" onClick={() => go("signup")}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
