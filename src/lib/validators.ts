import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(20).optional().or(z.literal("")),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(1).max(100),
});

export const carCreateSchema = z.object({
  brand: z.string().min(1).max(80),
  model: z.string().min(1).max(80),
  type: z.enum(["Sedan", "SUV", "Hatchback", "Luxury", "Van", "Coupe", "Pickup"]),
  transmission: z.enum(["Automatic", "Manual"]),
  fuel: z.enum(["Petrol", "Diesel", "Hybrid", "Electric"]),
  seats: z.number().int().min(1).max(20),
  doors: z.number().int().min(2).max(6).default(4),
  pricePerDay: z.number().positive().max(1000000),
  withDriver: z.boolean().default(false),
  city: z.string().min(1).max(80),
  images: z.array(z.string().url().max(500)).min(1).max(10),
  features: z.array(z.string().max(60)).max(30).default([]),
  description: z.string().min(1).max(2000),
  available: z.boolean().default(true),
});

export const bookingCreateSchema = z.object({
  vehicleId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  withDriver: z.boolean().default(false),
  pickupLocation: z.string().min(2).max(200),
  dropoffLocation: z.string().max(200).optional().or(z.literal("")),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(4).max(20),
  customerEmail: z.string().email().max(120),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  vehicleId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(2).max(1000),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(120),
  phone: z.string().max(20).optional().or(z.literal("")),
  subject: z.string().min(2).max(200),
  message: z.string().min(2).max(3000),
});

export const bookingStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});
