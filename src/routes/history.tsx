import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useLottery } from "@/lib/lottery-store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Historie — Lunch Lottery" },
      { name: "description", content: "Übersicht aller bisherigen Lunch Lottery Runden." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { rounds } = useLottery();
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Historie</h1>
      <p className="text-muted-foreground mt-1 mb-8">{rounds.length} gespeicherte Runden</p>

      {rounds.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Noch keine Runden gespeichert.
        </Card>
      ) : (
        <div className="space-y-4">
          {rounds.map((r, idx) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-full">
                    Runde #{rounds.length - idx}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(r.date).toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" })}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Pool: {r.poolSize}</span>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {r.winners.map((w, i) => (
                  <div key={w.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                    <span className="text-xs font-bold w-5 text-muted-foreground">{i + 1}.</span>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{w.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{w.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
