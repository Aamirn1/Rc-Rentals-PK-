"use client";

import { useState } from "react";
import { ShimmerLogo } from "@/components/effects/shimmer-logo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { contactSchema } from "@/lib/validators";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "923115794492";

const FAQS = [
  { q: "What documents do I need to rent a car?", a: "You need a valid CNIC (or passport for foreigners), a valid driving license (for self-drive), and a credit/debit card or cash for the security deposit." },
  { q: "Is a security deposit required?", a: "Yes, a refundable security deposit is taken at pickup and returned when the vehicle is returned in the same condition." },
  { q: "Can I rent a car with a driver?", a: "Absolutely. Many of our vehicles offer a professional chauffeur option — look for the 'Driver' badge on car cards." },
  { q: "What is the minimum rental period?", a: "The minimum rental period is 24 hours. Discounts are available for weekly and monthly rentals." },
  { q: "Do you offer airport pickup?", a: "Yes, we provide free pickup and drop-off at major airports including Islamabad, Lahore, and Karachi. Mention it in your booking notes." },
  { q: "What if the car breaks down?", a: "Call our 24/7 support line immediately. We arrange roadside assistance or a replacement vehicle at no extra cost." },
];

export function ContactView() {
  const setView = useAppStore((s) => s.setView);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please fill the form correctly.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to send message.");
        return;
      }
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">Get in Touch</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Let&apos;s <span className="text-gradient-gold">Talk</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Questions about a booking, a custom tour package, or corporate rentals? Our team is here to help — 24/7.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <Card className="p-6 md:p-8 bg-card border-border">
            <h2 className="text-2xl font-bold mb-1">Send us a message</h2>
            <p className="text-sm text-muted-foreground mb-6">We typically reply within a few hours.</p>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" maxLength={120} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" maxLength={120} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03xx-xxxxxxx" maxLength={20} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" maxLength={200} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your trip, dates, vehicle preference..." rows={5} maxLength={3000} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Send className="w-4 h-4" />
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Card>

          {/* Contact info + WhatsApp */}
          <div className="space-y-6">
            <Card className="glass p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <ShimmerLogo className="text-xl" />
              </div>
              <div className="space-y-4">
                <ContactRow icon={MapPin} title="Visit Us" lines={["F-8 Markaz, Islamabad", "Pakistan"]} />
                <ContactRow icon={Phone} title="Call Us" lines={["+92 311 5794492"]} href="tel:+923115794492" />
                <ContactRow icon={Mail} title="Email Us" lines={["info@rcrentals.pk"]} href="mailto:info@rcrentals.pk" />
                <ContactRow icon={Clock} title="Hours" lines={["Open 24/7", "365 days a year"]} />
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-gradient-to-br from-[#25D366]/15 to-transparent border-[#25D366]/30">
              <div className="flex items-start gap-4">
                <div className="grid place-items-center w-12 h-12 rounded-full bg-[#25D366] text-white shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Chat on WhatsApp</h3>
                  <p className="text-sm text-muted-foreground mb-3">Fastest way to reach us. Get instant replies to your queries.</p>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#25D366] text-white hover:bg-[#25D366]/90 gap-2">
                      <MessageCircle className="w-4 h-4" /> Open WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 bg-card border-border">
              <h3 className="font-semibold mb-1">Want to browse first?</h3>
              <p className="text-sm text-muted-foreground mb-4">Explore our fleet of 500+ vehicles across Pakistan.</p>
              <Button variant="outline" onClick={() => setView("cars")}>View Our Cars</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know before you book.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="group rounded-lg border border-border bg-background/50 overflow-hidden">
                <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none font-medium hover:bg-white/5 transition-colors">
                  {faq.q}
                  <span className="text-primary transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactRow({ icon: Icon, title, lines, href }: { icon: React.ElementType; title: string; lines: string[]; href?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid place-items-center w-10 h-10 rounded-lg bg-primary/15 text-primary shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {lines.map((l, i) => (
          <a key={i} href={href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
            {l}
          </a>
        ))}
      </div>
    </div>
  );
}
