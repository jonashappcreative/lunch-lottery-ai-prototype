import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useLottery, addEmployee, removeEmployee, resetAll, resetEligibility,
} from "@/lib/lottery-store";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Lunch Lottery" },
      { name: "description", content: "Mitarbeitende und Daten der Lunch Lottery verwalten." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const state = useLottery();
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return state.employees;
    return state.employees.filter(
      (e) => e.name.toLowerCase().includes(f) || e.department.toLowerCase().includes(f),
    );
  }, [state.employees, filter]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground mt-1">Mitarbeitende & Daten verwalten</p>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold mb-3">Neue:n Mitarbeitende:n hinzufügen</h2>
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
          <Input placeholder="Department (optional)" value={dept} onChange={(e) => setDept(e.target.value)} className="max-w-xs" />
          <Button
            onClick={() => {
              if (!name.trim()) return toast.error("Name fehlt");
              addEmployee(name, dept);
              setName(""); setDept("");
              toast.success("Hinzugefügt");
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Hinzufügen
          </Button>
          <Button variant="outline" disabled title="Bald verfügbar">
            <Upload className="h-4 w-4 mr-1" /> CSV-Import (bald)
          </Button>
        </div>
      </Card>

      <Card className="p-5 border-destructive/30">
        <h2 className="font-semibold mb-1">Gefahrenzone</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Setzt entweder nur die Sperren zurück oder die gesamte Demo auf den Ausgangszustand.
        </p>
        <div className="flex flex-wrap gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Sperren zurücksetzen</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Alle Sperren aufheben?</AlertDialogTitle>
                <AlertDialogDescription>
                  Alle Mitarbeitenden werden wieder eligible. Historie bleibt erhalten.
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Demo-Daten zurücksetzen</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Alle Daten löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Mitarbeiterliste & Historie werden auf das Beispiel-Dataset (150 Personen) zurückgesetzt.
                  Dieser Vorgang kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={() => { resetAll(); toast.success("Daten zurückgesetzt"); }}>
                  Endgültig zurücksetzen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-xl font-bold">Mitarbeitende ({state.employees.length})</h2>
          <Input placeholder="Suchen…" value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-xs" />
        </div>
        <Card className="overflow-hidden">
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10">
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Department</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium text-right">Gewinne</th>
                  <th className="px-4 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-2 font-medium">{e.name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{e.department}</td>
                    <td className="px-4 py-2">
                      {e.eligible ? (
                        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">
                          eligible
                        </span>
                      ) : (
                        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          gesperrt
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{e.drawCount}</td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => { removeEmployee(e.id); toast(`${e.name} entfernt`); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Keine Mitarbeitenden gefunden.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
