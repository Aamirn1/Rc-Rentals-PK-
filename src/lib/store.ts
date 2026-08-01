import { create } from "zustand";

export type ViewName =
  | "home"
  | "cars"
  | "car-details"
  | "booking"
  | "about"
  | "contact"
  | "login"
  | "signup"
  | "profile"
  | "admin";

export interface SearchFilters {
  city: string;
  type: string;
  transmission: string;
  withDriver: boolean;
  minPrice: number;
  maxPrice: number;
  sort: string;
  query: string;
}

export interface BookingDraft {
  vehicleId: string;
  vehicleName?: string;
  startDate: string;
  endDate: string;
  withDriver: boolean;
  pickupLocation: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}

interface AppState {
  view: ViewName;
  selectedCarId: string | null;
  filters: SearchFilters;
  bookingDraft: BookingDraft | null;
  user: CurrentUser | null;
  authLoading: boolean;

  setView: (view: ViewName) => void;
  setSelectedCarId: (id: string | null) => void;
  setFilters: (f: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setBookingDraft: (d: BookingDraft | null) => void;
  setUser: (u: CurrentUser | null) => void;
  setAuthLoading: (b: boolean) => void;
  logout: () => void;
}

const defaultFilters: SearchFilters = {
  city: "All",
  type: "All",
  transmission: "All",
  withDriver: false,
  minPrice: 0,
  maxPrice: 50000,
  sort: "featured",
  query: "",
};

export const useAppStore = create<AppState>((set) => ({
  view: "home",
  selectedCarId: null,
  filters: defaultFilters,
  bookingDraft: null,
  user: null,
  authLoading: true,

  setView: (view) => {
    set({ view });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
  setSelectedCarId: (id) => set({ selectedCarId: id }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setBookingDraft: (d) => set({ bookingDraft: d }),
  setUser: (u) => set({ user: u }),
  setAuthLoading: (b) => set({ authLoading: b }),
  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    set({ user: null, view: "home" });
  },
}));

export const PAKISTAN_CITIES = [
  "All",
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

export const CAR_TYPES = ["All", "Sedan", "SUV", "Hatchback", "Luxury", "Van", "Coupe", "Pickup"];
