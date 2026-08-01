"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

const WHATSAPP_NUMBER = "923115794492";
const DEFAULT_MESSAGE = "Hello RC Rentals PK! I'd like to know more about your car rental services.";

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="glass rounded-2xl p-3 max-w-[240px] shadow-xl animate-fade-up">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-foreground">Need help? Chat with us!</p>
            <button onClick={() => setOpen(false)} aria-label="Close chat bubble" className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Our team typically replies within minutes.
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#25D366] hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Open WhatsApp
          </a>
        </div>
      )}
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
