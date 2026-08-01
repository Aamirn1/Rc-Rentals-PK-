import { cn } from "@/lib/utils";

interface ShimmerLogoProps {
  className?: string;
  as?: "span" | "h1" | "div";
}

/** Shimmering (shine) logo text — moving metallic gradient clipped to text. */
export function ShimmerLogo({ className, as = "span" }: ShimmerLogoProps) {
  const Tag = as as "span";
  return (
    <Tag className={cn("shimmer-logo font-extrabold tracking-tight select-none", className)}>
      RC Rentals PK
    </Tag>
  );
}
