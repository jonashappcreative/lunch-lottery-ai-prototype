import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { LocationSwitcher } from "@/components/LocationSwitcher";

const navItems = [
  { to: "/", label: "Start" },
  { to: "/draw", label: "Ziehung" },
  { to: "/history", label: "Historie" },
  { to: "/admin", label: "Admin" },
] as const;

export function AppHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-6 flex-wrap">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-card">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Lunch Lottery</span>
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          <LocationSwitcher />
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeProps={{ className: "px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

