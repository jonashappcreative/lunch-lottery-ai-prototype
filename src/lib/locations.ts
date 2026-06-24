export type LocationId = "hamburg" | "duesseldorf";

export type LocationConfig = {
  id: LocationId;
  label: string;
  winnersPerRound: number;
  totalCards: number;
  gridCols: 3 | 4;
  cadence: string;
};

export const LOCATIONS: Record<LocationId, LocationConfig> = {
  hamburg: {
    id: "hamburg",
    label: "Hamburg",
    winnersPerRound: 6,
    totalCards: 16,
    gridCols: 4,
    cadence: "Alle 2 Wochen",
  },
  duesseldorf: {
    id: "duesseldorf",
    label: "Düsseldorf",
    winnersPerRound: 2,
    totalCards: 9,
    gridCols: 3,
    cadence: "Wöchentlich",
  },
};

export const LOCATION_LIST: LocationConfig[] = [LOCATIONS.hamburg, LOCATIONS.duesseldorf];

export const UNBLOCK_THRESHOLD = 0.8;
