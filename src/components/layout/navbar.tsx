"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
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
        <button onClick={() => go("home")} className="flex items-center gap-2 group" aria-label="Rajpoot Cars Rentals PK home">
          <img
            src="/logo.png"
            alt="Rajpoot Cars Rentals PK logo"
            className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-110"
          />
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
          <SheetContent side="right" className="w-[280px] bg-card border-l-border p-0 flex flex-col">
            {/* Header: logo only — the built-in SheetContent close (top-right X) handles closing (removed duplicate custom X) */}
            <div className="flex items-center justify-center py-5 px-4 border-b border-border">
              <img
                src="/logo.png"
                alt="Rajpoot Cars Rentals PK logo"
                className="h-12 w-auto object-contain"
              />
            </div>

            {/* Middle: nav links (and authed actions) */}
            <div className="flex-1 flex flex-col p-4 gap-1 overflow-y-auto">
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
              {user && (
                <>
                  <div className="h-px bg-border my-2" />
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
              )}
            </div>

            {/* Bottom: Login + Sign Up in one row (Login first, then Sign Up) — only for guests */}
            {!user && (
              <div className="p-4 border-t border-border grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => go("login")}>
                  Login
                </Button>
                <Button onClick={() => go("signup")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign Up
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
