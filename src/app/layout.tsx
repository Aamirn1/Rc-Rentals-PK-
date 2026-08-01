import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RC Rentals PK – Premium Car Rental in Pakistan | Islamabad, Lahore, Karachi",
  description:
    "RC Rentals PK offers affordable self-drive and chauffeur car rentals across Pakistan. Book SUVs, sedans, luxury cars and vans in Islamabad, Lahore, Karachi & more. Rent a car for trips, tours, weddings and events.",
  keywords: [
    "rent a car Islamabad",
    "car rental Lahore",
    "car hire Karachi",
    "self-drive car rental Pakistan",
    "wedding car hire Islamabad",
    "SUV rental Pakistan",
    "chauffeur drive Pakistan",
    "RC Rentals PK",
  ],
  authors: [{ name: "RC Rentals PK" }],
  metadataBase: new URL("https://rc-rentals-pk.vercel.app"),
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "RC Rentals PK – Premium Car Rental in Pakistan",
    description:
      "Affordable self-drive & chauffeur car rentals across Pakistan. Book SUVs, sedans, luxury cars & vans for trips, tours, weddings and events.",
    url: "https://rc-rentals-pk.vercel.app",
    siteName: "RC Rentals PK",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "RC Rentals PK – Premium Car Rental in Pakistan",
    description: "Affordable self-drive & chauffeur car rentals across Pakistan.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
