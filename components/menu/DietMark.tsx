import type { Diet } from "@/lib/menu";

/** The square veg / non-veg marks Indian menus use. */
export function DietMark({ diet, className = "" }: { diet: Diet; className?: string }) {
  const veg = diet === "veg";
  return (
    <svg
      viewBox="0 0 16 16"
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      className={`size-3.5 shrink-0 ${veg ? "text-veg" : "text-nonveg"} ${className}`}
    >
      <rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {veg ? (
        <circle cx="8" cy="8" r="3.4" fill="currentColor" />
      ) : (
        <path d="M8 4.3 11.6 11H4.4Z" fill="currentColor" />
      )}
    </svg>
  );
}

export function ChiliIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M11.3 1.2c.4-.2.8 0 .9.4.1.5.4.9.9 1.1 1.2.5 1.6 2 1 3.1-1.6 3.3-4.6 6.9-9.4 8.3-1.3.4-2.9.3-3.6-.5-.3-.4 0-.9.4-.9 3.3-.4 6.3-2.6 7.6-6.4.3-.9 1-1.6 1.9-1.9-.1-.9.1-2.6.3-3.2Z"
      />
    </svg>
  );
}
