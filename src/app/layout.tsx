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
  title: "Rajpoot Cars Rentals PK – Premium Car Rental in Pakistan | Islamabad, Lahore, Karachi",
  description:
    "Rajpoot Cars Rentals PK offers affordable self-drive and chauffeur car rentals across Pakistan. Book SUVs, sedans, luxury cars and vans in Islamabad, Lahore, Karachi & more. Rent a car for trips, tours, weddings and events.",
  keywords: [
    "rent a car Islamabad",
    "car rental Lahore",
    "car hire Karachi",
    "self-drive car rental Pakistan",
    "wedding car hire Islamabad",
    "SUV rental Pakistan",
    "chauffeur drive Pakistan",
    "Rajpoot Cars Rentals PK",
  ],
  authors: [{ name: "Rajpoot Cars Rentals PK" }],
  metadataBase: new URL("https://rajpootcarrentalspk.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Rajpoot Cars Rentals PK – Premium Car Rental in Pakistan",
    description:
      "Affordable self-drive & chauffeur car rentals across Pakistan. Book SUVs, sedans, luxury cars & vans for trips, tours, weddings and events.",
    url: "https://rajpootcarrentalspk.vercel.app",
    siteName: "Rajpoot Cars Rentals PK",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "https://rajpootcarrentalspk.vercel.app/og-image.jpg",
        secureUrl: "https://rajpootcarrentalspk.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rajpoot Cars Rentals PK – Premium Car Rental in Pakistan",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rajpoot Cars Rentals PK – Premium Car Rental in Pakistan",
    description: "Affordable self-drive & chauffeur car rentals across Pakistan.",
    images: ["https://rajpootcarrentalspk.vercel.app/og-image.jpg"],
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
