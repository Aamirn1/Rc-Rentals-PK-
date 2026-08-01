"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { useAuth } from "@/hooks/use-auth";

// Lazy-load views (code-splitting; 3D only loads with home)
const HomeView = dynamic(() => import("@/components/views/home-view").then((m) => m.HomeView), {
  loading: () => <ViewLoader />,
});
const CarsView = dynamic(() => import("@/components/views/cars-view").then((m) => m.CarsView), {
  loading: () => <ViewLoader />,
});
const CarDetailsView = dynamic(() => import("@/components/views/car-details-view").then((m) => m.CarDetailsView), {
  loading: () => <ViewLoader />,
});
const BookingView = dynamic(() => import("@/components/views/booking-view").then((m) => m.BookingView), {
  loading: () => <ViewLoader />,
});
const AboutView = dynamic(() => import("@/components/views/about-view").then((m) => m.AboutView), {
  loading: () => <ViewLoader />,
});
const ContactView = dynamic(() => import("@/components/views/contact-view").then((m) => m.ContactView), {
  loading: () => <ViewLoader />,
});
const LoginView = dynamic(() => import("@/components/views/login-view").then((m) => m.LoginView), {
  loading: () => <ViewLoader />,
});
const SignupView = dynamic(() => import("@/components/views/signup-view").then((m) => m.SignupView), {
  loading: () => <ViewLoader />,
});
const ProfileView = dynamic(() => import("@/components/views/profile-view").then((m) => m.ProfileView), {
  loading: () => <ViewLoader />,
});
const AdminView = dynamic(() => import("@/components/views/admin-view").then((m) => m.AdminView), {
  loading: () => <ViewLoader />,
});

function ViewLoader() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export default function Page() {
  const view = useAppStore((s) => s.view);
  useAuth();

  // Ensure each view starts at the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {view === "home" && <HomeView />}
        {view === "cars" && <CarsView />}
        {view === "car-details" && <CarDetailsView />}
        {view === "booking" && <BookingView />}
        {view === "about" && <AboutView />}
        {view === "contact" && <ContactView />}
        {view === "login" && <LoginView />}
        {view === "signup" && <SignupView />}
        {view === "profile" && <ProfileView />}
        {view === "admin" && <AdminView />}
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
}
