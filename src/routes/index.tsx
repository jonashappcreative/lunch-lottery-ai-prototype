import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLottery, eligibleCount, WINNERS_PER_ROUND } from "@/lib/lottery-store";
import { ArrowRight, History, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lunch Lottery — Start" },
      { name: "description", content: "Startet eure nächste Lunch Lottery Ziehung." },
    ],
  }),
  component: Index,
});

function Index() {
  const state = useLottery();
  const drawn = state.openedCards.length;
  const eligible = eligibleCount(state);
  const recent = state.rounds.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <div className="text-center space-y-6">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="h-4 w-4" /> Alle zwei Wochen frisch gezogen
        </span>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Lunch Lottery</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Wählt nacheinander sechs Karten aus. Jede Karte enthüllt eine Gewinner:in für euer nächstes
          gemeinsames Lunch.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button asChild size="lg" className="text-base h-12 px-6">
            <Link to="/draw">
              Neue Ziehung starten <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base h-12 px-6">
            <Link to="/history"><History className="mr-2 h-5 w-5" /> Historie</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground pt-2">
          {drawn} von {WINNERS_PER_ROUND} Gewinner:innen in der aktuellen Runde gezogen
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-16">
        <StatCard icon={<Users className="h-5 w-5" />} label="Mitarbeitende" value={state.employees.length} />
        <StatCard icon={<Sparkles className="h-5 w-5" />} label="Verfügbar (eligible)" value={eligible} />
        <StatCard icon={<History className="h-5 w-5" />} label="Abgeschlossene Runden" value={state.rounds.length} />
      </div>

      <section className="mt-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Letzte Runden</h2>
          <Link to="/history" className="text-sm text-primary hover:underline">Alle ansehen</Link>
        </div>
        {recent.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Noch keine Runden gespeichert. Startet eure erste Ziehung!
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {recent.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="text-sm text-muted-foreground mb-2">
                  {new Date(r.date).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {r.winners.map((w) => (
                    <span key={w.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {w.name}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="grid place-items-center h-12 w-12 rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </Card>
  );
}
