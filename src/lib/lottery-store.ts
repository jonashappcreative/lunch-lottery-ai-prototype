import { useSyncExternalStore } from "react";
import { generateSampleEmployees, type SampleEmployee } from "./sample-employees";
import {
  LOCATIONS,
  UNBLOCK_THRESHOLD,
  type LocationConfig,
  type LocationId,
} from "./locations";

export type Employee = SampleEmployee;

export type LotteryRound = {
  id: string;
  date: string;
  location: LocationId;
  winners: { id: string; name: string; department: string }[];
  poolSize: number;
};

export type OpenedCard = {
  cardIndex: number;
  employeeId: string;
  order: number;
};

type LocationDrawState = {
  openedCards: OpenedCard[];
  roundCompleted: boolean;
};

export type LotteryState = {
  employees: Employee[];
  rounds: LotteryRound[];
  selectedLocation: LocationId;
  drawByLocation: Record<LocationId, LocationDrawState>;
};

const STORAGE_KEY = "lunch-lottery-state-v2";
export { UNBLOCK_THRESHOLD };

function emptyDraw(): LocationDrawState {
  return { openedCards: [], roundCompleted: false };
}

function initialState(): LotteryState {
  return {
    employees: generateSampleEmployees(),
    rounds: [],
    selectedLocation: "hamburg",
    drawByLocation: {
      hamburg: emptyDraw(),
      duesseldorf: emptyDraw(),
    },
  };
}

function load(): LotteryState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as LotteryState;
    if (!parsed.employees?.length) return initialState();
    // backfill defaults
    if (!parsed.drawByLocation) {
      parsed.drawByLocation = { hamburg: emptyDraw(), duesseldorf: emptyDraw() };
    }
    if (!parsed.selectedLocation) parsed.selectedLocation = "hamburg";
    return parsed;
  } catch {
    return initialState();
  }
}

let state: LotteryState = initialState();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}
function setState(updater: (s: LotteryState) => LotteryState) {
  state = updater(state);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }
  emit();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = load();
  emit();
}

export function useLottery(): LotteryState {
  return useSyncExternalStore(
    (cb) => {
      hydrate();
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

// ---------- Selectors ----------

export function currentLocationConfig(s: LotteryState): LocationConfig {
  return LOCATIONS[s.selectedLocation];
}

export function locationEmployees(s: LotteryState, loc: LocationId): Employee[] {
  return s.employees.filter((e) => e.location === loc);
}

export function eligibleCount(s: LotteryState, loc?: LocationId): number {
  const l = loc ?? s.selectedLocation;
  return s.employees.filter((e) => e.location === l && e.eligible).length;
}

export function currentDraw(s: LotteryState): LocationDrawState {
  return s.drawByLocation[s.selectedLocation] ?? emptyDraw();
}

// ---------- Actions ----------

export function setLocation(loc: LocationId) {
  setState((s) => ({ ...s, selectedLocation: loc }));
}

export function drawCardForEmployee(cardIndex: number): Employee | null {
  const loc = state.selectedLocation;
  const cfg = LOCATIONS[loc];
  const draw = state.drawByLocation[loc] ?? emptyDraw();
  if (draw.roundCompleted) return null;
  if (draw.openedCards.length >= cfg.winnersPerRound) return null;
  if (draw.openedCards.some((c) => c.cardIndex === cardIndex)) return null;

  const alreadyDrawn = new Set(draw.openedCards.map((c) => c.employeeId));
  const pool = state.employees.filter(
    (e) => e.location === loc && e.eligible && !alreadyDrawn.has(e.id),
  );
  if (pool.length === 0) return null;

  const winner = pool[Math.floor(Math.random() * pool.length)];
  const order = draw.openedCards.length + 1;
  const willComplete = order === cfg.winnersPerRound;

  setState((s) => ({
    ...s,
    drawByLocation: {
      ...s.drawByLocation,
      [loc]: {
        openedCards: [...draw.openedCards, { cardIndex, employeeId: winner.id, order }],
        roundCompleted: willComplete,
      },
    },
  }));
  return winner;
}

export function startNewRound() {
  const loc = state.selectedLocation;
  setState((s) => ({
    ...s,
    drawByLocation: { ...s.drawByLocation, [loc]: emptyDraw() },
  }));
}

export function saveRound() {
  const loc = state.selectedLocation;
  const cfg = LOCATIONS[loc];
  const draw = state.drawByLocation[loc] ?? emptyDraw();
  if (draw.openedCards.length !== cfg.winnersPerRound) return;

  const winners = draw.openedCards
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((oc) => {
      const e = state.employees.find((x) => x.id === oc.employeeId)!;
      return { id: e.id, name: e.name, department: e.department };
    });
  const round: LotteryRound = {
    id: `round_${Date.now().toString(36)}`,
    date: new Date().toISOString(),
    location: loc,
    winners,
    poolSize: state.employees.filter((e) => e.location === loc && e.eligible).length,
  };
  const winnerIds = new Set(winners.map((w) => w.id));

  setState((s) => {
    const locEmployees = s.employees.filter((e) => e.location === loc);
    const threshold = Math.ceil(UNBLOCK_THRESHOLD * Math.max(1, locEmployees.length - 1));

    const updated = s.employees.map((e) => {
      if (e.location !== loc) return e;
      if (e.blockedUntilThresholdMet) {
        const seen = new Set(e.drawnSinceBlock);
        for (const wid of winnerIds) if (wid !== e.id) seen.add(wid);
        const drawnSinceBlock = Array.from(seen);
        if (drawnSinceBlock.length >= threshold) {
          return {
            ...e,
            drawnSinceBlock: [],
            blockedUntilThresholdMet: false,
            eligible: true,
          };
        }
        return { ...e, drawnSinceBlock };
      }
      return e;
    });

    const withWinners = updated.map((e) => {
      if (winnerIds.has(e.id)) {
        return {
          ...e,
          drawCount: e.drawCount + 1,
          lastWonRoundId: round.id,
          blockedUntilThresholdMet: true,
          drawnSinceBlock: [],
          eligible: false,
        };
      }
      return e;
    });

    // Reorder only within the location
    const others = withWinners.filter((e) => e.location !== loc);
    const locOnly = withWinners.filter((e) => e.location === loc);
    const nonWinners = locOnly.filter((e) => !winnerIds.has(e.id));
    const winnersOrdered = winners
      .map((w) => locOnly.find((e) => e.id === w.id)!)
      .filter(Boolean);

    return {
      ...s,
      employees: [...others, ...nonWinners, ...winnersOrdered],
      rounds: [round, ...s.rounds],
      drawByLocation: { ...s.drawByLocation, [loc]: emptyDraw() },
    };
  });
}

export function resetEligibility(loc?: LocationId) {
  const target = loc ?? state.selectedLocation;
  setState((s) => ({
    ...s,
    employees: s.employees.map((e) =>
      e.location === target
        ? { ...e, eligible: true, blockedUntilThresholdMet: false, drawnSinceBlock: [] }
        : e,
    ),
  }));
}

export function resetAll() {
  setState(() => initialState());
}

export function addEmployee(name: string, department: string, location: LocationId) {
  if (!name.trim()) return;
  setState((s) => ({
    ...s,
    employees: [
      ...s.employees,
      {
        id: `emp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim(),
        department: department.trim() || "—",
        location,
        drawCount: 0,
        blockedUntilThresholdMet: false,
        drawnSinceBlock: [],
        eligible: true,
      },
    ],
  }));
}

export function removeEmployee(id: string) {
  setState((s) => ({ ...s, employees: s.employees.filter((e) => e.id !== id) }));
}
