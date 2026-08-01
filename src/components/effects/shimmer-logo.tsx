import { cn } from "@/lib/utils";

interface ShimmerLogoProps {
  className?: string;
  as?: "span" | "h1" | "div";
  /** Render as two stacked lines: "Rajpoot Cars" / "Rentals PK". Default true. */
  twoLine?: boolean;
}

/** Shimmering (shine) logo text — moving metallic gradient clipped to text. */
export function ShimmerLogo({ className, as = "span", twoLine = true }: ShimmerLogoProps) {
  const Tag = as as "span";
  if (twoLine) {
    return (
      <Tag className={cn("shimmer-logo font-extrabold tracking-tight select-none leading-none flex flex-col", className)}>
        <span className="text-base sm:text-lg">Rajpoot Cars</span>
        <span className="text-[0.65em] sm:text-[0.7em] text-primary/90 -mt-0.5">Rentals PK</span>
      </Tag>
    );
  }
  return (
    <Tag className={cn("shimmer-logo font-extrabold tracking-tight select-none", className)}>
      Rajpoot Cars Rentals PK
    </Tag>
  );
}
