import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  index: number;
  Icon: LucideIcon;
  iconLabel: string;
  opened: boolean;
  disabled: boolean;
  winnerName?: string;
  winnerDepartment?: string;
  order?: number;
  onClick: () => void;
};

export function LotteryCard({
  Icon,
  iconLabel,
  opened,
  disabled,
  winnerName,
  winnerDepartment,
  order,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={opened || disabled}
      aria-label={opened ? `Gewinner ${order}: ${winnerName}` : `Karte ${iconLabel}`}
      className={cn(
        "flip-card h-full w-full min-h-0 focus:outline-none group",
        opened && "flipped",
      )}
    >
      <div
        className={cn(
          "flip-card-inner rounded-2xl",
          !opened && !disabled && "group-hover:scale-[1.03] group-active:scale-[0.98] transition-transform",
        )}
        style={{ transition: "transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1)" }}
      >
        {/* Front */}
        <div
          className={cn(
            "flip-face flex flex-col items-center justify-center gap-3 p-4",
            "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground",
            "shadow-card",
            disabled && !opened && "opacity-40 grayscale",
          )}
        >
          <Icon className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20" strokeWidth={1.5} />
          <span className="text-xs md:text-sm lg:text-base font-medium opacity-90">{iconLabel}</span>
        </div>
        {/* Back */}
        <div className="flip-face flip-back flex flex-col items-center justify-center gap-2 p-4 bg-card border-2 border-primary/30 shadow-elevated text-center">
          {order != null && (
            <span className="inline-flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Gewinner:in #{order}
            </span>
          )}
          <span className="text-lg md:text-2xl font-bold leading-tight text-foreground break-words">
            {winnerName}
          </span>
          {winnerDepartment && (
            <span className="text-xs md:text-sm text-muted-foreground">{winnerDepartment}</span>
          )}
        </div>
      </div>
    </button>
  );
}
