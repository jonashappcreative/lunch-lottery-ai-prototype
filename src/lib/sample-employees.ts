const firstNames = [
  "Anna", "Ben", "Clara", "David", "Emma", "Felix", "Greta", "Hannes",
  "Ida", "Jonas", "Klara", "Leo", "Mia", "Noah", "Olivia", "Paul",
  "Quentin", "Romy", "Stefan", "Tina", "Uwe", "Vera", "Wanda", "Xenia",
  "Yannick", "Zoe", "Alex", "Bella", "Carl", "Diana", "Elias", "Frieda",
  "Georg", "Helena", "Ines", "Jakob", "Karla", "Lukas", "Marie", "Nils",
  "Otto", "Pia", "Rafael", "Sophie", "Tom", "Ulla", "Viktor", "Wilma",
  "Yara", "Zacharias",
];
const lastNames = [
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner",
  "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter",
  "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann", "Braun",
  "Krüger", "Hofmann", "Hartmann", "Lange", "Schmitt", "Werner", "Krause",
  "Lehmann", "Schmid",
];
const departments = [
  "Engineering", "Design", "Marketing", "Sales", "People", "Finance",
  "Operations", "Product", "Support", "Data",
];

export type SampleEmployee = {
  id: string;
  name: string;
  department: string;
  drawCount: number;
  lastWonRoundId?: string;
  blockedUntilThresholdMet: boolean;
  drawnSinceBlock: string[];
  eligible: boolean;
};

// Deterministic PRNG so SSR/CSR match
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSampleEmployees(count = 150): SampleEmployee[] {
  const rand = mulberry32(42);
  const used = new Set<string>();
  const out: SampleEmployee[] = [];
  let i = 0;
  while (out.length < count) {
    const f = firstNames[Math.floor(rand() * firstNames.length)];
    const l = lastNames[Math.floor(rand() * lastNames.length)];
    const name = `${f} ${l}`;
    const key = `${name}-${i}`;
    if (used.has(key)) {
      i++;
      continue;
    }
    used.add(key);
    out.push({
      id: `emp_${i.toString(36)}_${Math.floor(rand() * 1e6).toString(36)}`,
      name,
      department: departments[Math.floor(rand() * departments.length)],
      drawCount: 0,
      blockedUntilThresholdMet: false,
      drawnSinceBlock: [],
      eligible: true,
    });
    i++;
  }
  return out;
}
