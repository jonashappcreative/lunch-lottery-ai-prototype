import { useSyncExternalStore } from "react";
import { generateSampleEmployees, type SampleEmployee } from "./sample-employees";

export type Employee = SampleEmployee;

export type LotteryRound = {
  id: string;
  date: string;
  winners: { id: string; name: string; department: string }[];
  poolSize: number;
};

export type OpenedCard = {
  cardIndex: number;
  employeeId: string;
  order: number; // 1..6
};

export type LotteryState = {
  employees: Employee[];
  rounds: LotteryRound[];
  openedCards: OpenedCard[];
  roundCompleted: boolean;
};

const STORAGE_KEY = "lunch-lottery-state-v1";
export const UNBLOCK_THRESHOLD = 0.8;
export const WINNERS_PER_ROUND = 6;
export const TOTAL_CARDS = 16;

function initialState(): LotteryState {
  return {
    employees: generateSampleEmployees(150),
    rounds: [],
    openedCards: [],
    roundCompleted: false,
  };
}

function load(): LotteryState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as LotteryState;
    if (!parsed.employees?.length) return initialState();
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

// ---------- Actions ----------

export function drawCardForEmployee(cardIndex: number): Employee | null {
  if (state.roundCompleted) return null;
  if (state.openedCards.length >= WINNERS_PER_ROUND) return null;
  if (state.openedCards.some((c) => c.cardIndex === cardIndex)) return null;

  const alreadyDrawn = new Set(state.openedCards.map((c) => c.employeeId));
  const pool = state.employees.filter(
    (e) => e.eligible && !alreadyDrawn.has(e.id),
  );
  if (pool.length === 0) return null;

  const winner = pool[Math.floor(Math.random() * pool.length)];
  const order = state.openedCards.length + 1;
  const willComplete = order === WINNERS_PER_ROUND;

  setState((s) => ({
    ...s,
    openedCards: [...s.openedCards, { cardIndex, employeeId: winner.id, order }],
    roundCompleted: willComplete,
  }));
  return winner;
}

export function startNewRound() {
  setState((s) => ({ ...s, openedCards: [], roundCompleted: false }));
}

export function saveRound() {
  if (state.openedCards.length !== WINNERS_PER_ROUND) return;
  const winners = state.openedCards
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((oc) => {
      const e = state.employees.find((x) => x.id === oc.employeeId)!;
      return { id: e.id, name: e.name, department: e.department };
    });
  const round: LotteryRound = {
    id: `round_${Date.now().toString(36)}`,
    date: new Date().toISOString(),
    winners,
    poolSize: state.employees.filter((e) => e.eligible).length,
  };
  const winnerIds = new Set(winners.map((w) => w.id));

  setState((s) => {
    // 1. update existing blocked employees: add new winners to their seen sets, maybe unblock
    const threshold = Math.ceil(UNBLOCK_THRESHOLD * (s.employees.length - 1));
    const updated = s.employees.map((e) => {
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
    // 2. mark new winners as blocked & bump counters
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
    // 3. move winners to end of list, preserving win order
    const nonWinners = withWinners.filter((e) => !winnerIds.has(e.id));
    const winnersOrdered = winners
      .map((w) => withWinners.find((e) => e.id === w.id)!)
      .filter(Boolean);

    return {
      ...s,
      employees: [...nonWinners, ...winnersOrdered],
      rounds: [round, ...s.rounds],
      openedCards: [],
      roundCompleted: false,
    };
  });
}

export function resetEligibility() {
  setState((s) => ({
    ...s,
    employees: s.employees.map((e) => ({
      ...e,
      eligible: true,
      blockedUntilThresholdMet: false,
      drawnSinceBlock: [],
    })),
  }));
}

export function resetAll() {
  setState(() => initialState());
}

export function addEmployee(name: string, department: string) {
  if (!name.trim()) return;
  setState((s) => ({
    ...s,
    employees: [
      ...s.employees,
      {
        id: `emp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim(),
        department: department.trim() || "—",
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

export function eligibleCount(s: LotteryState) {
  return s.employees.filter((e) => e.eligible).length;
}
