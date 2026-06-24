import { useLottery, setLocation } from "@/lib/lottery-store";
import { LOCATION_LIST } from "@/lib/locations";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocationSwitcher({ className }: { className?: string }) {
  const { selectedLocation } = useLottery();
  return (
    <div
      className={cn("inline-flex items-center gap-1 rounded-full bg-muted p-1", className)}
      role="tablist"
      aria-label="Standort wählen"
    >
      <MapPin className="h-4 w-4 text-muted-foreground ml-2" aria-hidden />
      {LOCATION_LIST.map((loc) => {
        const active = loc.id === selectedLocation;
        return (
          <button
            key={loc.id}
            role="tab"
            aria-selected={active}
            onClick={() => setLocation(loc.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {loc.label}
          </button>
        );
      })}
    </div>
  );
}
