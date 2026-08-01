"use client";

import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "923115794492";
const DEFAULT_MESSAGE = "Hello RC Rentals PK! I'd like to know more about your car rental services.";

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group grid place-items-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-transform animate-glow"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-background" />
      </a>
    </div>
  );
}
