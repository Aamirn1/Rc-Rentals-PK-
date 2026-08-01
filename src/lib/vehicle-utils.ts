// Helpers for parsing JSON fields stored as strings in SQLite
export function parseImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function parseFeatures(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function formatPKR(amount: number): string {
  return "Rs " + new Intl.NumberFormat("en-PK").format(Math.round(amount));
}

export function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return 0;
  return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  type: string;
  transmission: string;
  fuel: string;
  seats: number;
  doors: number;
  pricePerDay: number;
  withDriver: boolean;
  city: string;
  images: string;
  features: string;
  description: string;
  available: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleWithImages extends Omit<Vehicle, "images" | "features"> {
  images: string[];
  features: string[];
}

export function toVehicleWithImages(v: Vehicle): VehicleWithImages {
  return { ...v, images: parseImages(v.images), features: parseFeatures(v.features) };
}
