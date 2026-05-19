import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LotteryCard } from "@/components/LotteryCard";
import { LocationSwitcher } from "@/components/LocationSwitcher";
import { CARD_ICONS } from "@/lib/card-icons";
import {
  useLottery, drawCardForEmployee, saveRound, startNewRound,
  resetEligibility, eligibleCount, currentDraw, currentLocationConfig,
} from "@/lib/lottery-store";
import { toast } from "sonner";
import { PartyPopper, RotateCcw, Save } from "lucide-react";

export const Route = createFileRoute("/draw")({
  head: () => ({
    meta: [
      { title: "Ziehung — Lunch Lottery" },
      { name: "description", content: "Live-Ziehung der nächsten Lunch-Gewinner:innen." },
    ],
  }),
  component: DrawPage,
});

function DrawPage() {
  const state = useLottery();
  const cfg = currentLocationConfig(state);
  const draw = currentDraw(state);
  const drawn = draw.openedCards.length;
  const eligible = eligibleCount(state);
  const completed = draw.roundCompleted;

  const winnersList = draw.openedCards
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((oc) => {
      const e = state.employees.find((x) => x.id === oc.employeeId);
      return { order: oc.order, name: e?.name ?? "—", department: e?.department };
    });

  const enoughPool = eligible >= cfg.winnersPerRound;
  const gridClass =
    cfg.gridCols === 3
      ? "grid-cols-2 sm:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";

  function handleCardClick(cardIndex: number) {
    if (completed) return;
    if (!enoughPool && drawn === 0) {
      toast.error("Nicht genügend verfügbare Mitarbeitende für eine faire Ziehung.");
      return;
    }
    const winner = drawCardForEmployee(cardIndex);
    if (winner) {
      toast.success(`Gewinner:in #${drawn + 1}: ${winner.name}`);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <LocationSwitcher />
            <span className="text-xs text-muted-foreground">{cfg.cadence}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ziehung · {cfg.label}
          </h1>
          <p className="text-muted-foreground mt-1">
            {completed
              ? "Runde abgeschlossen — speichert sie oder bereitet eine neue vor."
              : `Wählt eine Karte aus · ${drawn} von ${cfg.winnersPerRound} gezogen`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-muted text-sm">
            Pool: <strong>{eligible}</strong> verfügbar
          </span>
          {drawn > 0 && !completed && (
            <Button variant="outline" size="sm" onClick={() => { startNewRound(); toast("Runde zurückgesetzt"); }}>
              <RotateCcw className="h-4 w-4 mr-1" /> Zurücksetzen
            </Button>
          )}
        </div>
      </div>

      {!enoughPool && drawn === 0 && (
        <Card className="p-5 mb-6 border-destructive/40 bg-destructive/5">
          <p className="font-medium text-foreground">
            Nicht genügend verfügbare Mitarbeitende für eine faire Ziehung in {cfg.label}.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Es sind nur {eligible} eligible Mitarbeitende vorhanden. Die 80%-Sperre kann administrativ
            zurückgesetzt werden.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-3">Sperren zurücksetzen</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sperren in {cfg.label} aufheben?</AlertDialogTitle>
                <AlertDialogDescription>
                  Damit werden alle Mitarbeitenden in {cfg.label} wieder ziehungsberechtigt.
                  Die Historie bleibt erhalten.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={() => { resetEligibility(); toast.success("Sperren aufgehoben"); }}>
                  Bestätigen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      )}

      <div className={`grid ${gridClass} gap-3 md:gap-5`}>
        {Array.from({ length: cfg.totalCards }).map((_, i) => {
          const icon = CARD_ICONS[i % CARD_ICONS.length];
          const opened = draw.openedCards.find((c) => c.cardIndex === i);
          const winner = opened
            ? state.employees.find((e) => e.id === opened.employeeId)
            : undefined;
          return (
            <LotteryCard
              key={i}
              index={i}
              Icon={icon.Icon}
              iconLabel={icon.label}
              opened={!!opened}
              disabled={completed && !opened}
              winnerName={winner?.name}
              winnerDepartment={winner?.department}
              order={opened?.order}
              onClick={() => handleCardClick(i)}
            />
          );
        })}
      </div>

      {completed && (
        <section className="mt-12 animate-pop-in">
          <Card className="p-8 border-primary/30 shadow-elevated">
            <div className="flex items-center gap-3 mb-6">
              <span className="grid place-items-center h-12 w-12 rounded-xl bg-primary text-primary-foreground">
                <PartyPopper className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Lunch Lottery {cfg.label} abgeschlossen</h2>
                <p className="text-muted-foreground">
                  {cfg.winnersPerRound === 1
                    ? "Eure Gewinner:in für das nächste Lunch"
                    : `Eure ${cfg.winnersPerRound} Gewinner:innen für das nächste Lunch`}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {winnersList.map((w) => (
                <div key={w.order} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <span className="grid place-items-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {w.order}
                  </span>
                  <div>
                    <div className="font-semibold">{w.name}</div>
                    {w.department && <div className="text-xs text-muted-foreground">{w.department}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => { saveRound(); toast.success("Runde gespeichert"); }}>
                <Save className="h-4 w-4 mr-2" /> Runde speichern
              </Button>
              <Button size="lg" variant="outline" onClick={() => { startNewRound(); toast("Neue Runde vorbereitet"); }}>
                Neue Runde vorbereiten
              </Button>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
