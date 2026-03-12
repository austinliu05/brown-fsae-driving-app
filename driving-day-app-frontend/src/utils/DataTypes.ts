import { ChartTypeRegistry } from "chart.js";

export const CATEGORIES = {
    BR_PRESSURE_FRONT: "Brake Pressure Front",
    BR_PRESSURE_BACK: "Brake Pressure Back",
    COOL_TEMP: "Coolant Temperature",
    ENG_OIL_PRESSURE: "Engine Oil Pressure"
} as const;
export type DataCategory = typeof CATEGORIES[keyof typeof CATEGORIES]

// Prefixed with 'H' indicates highest
// Prefixed with 'L' indicates lowest


export interface ReusableChartProps{
    // Frequency in terms of seconds: i.e. 1 = 1 second, 5 = every five seconds
    verticalLabel: string,
    horizontalLabel: string,
    chartPoints: any[],
    pageNumber: number,
    chartType: keyof ChartTypeRegistry
}

export interface StandardChartProps{
    verticalLabel: string,
    horizontalLabel: string,
    chartPoints: any[],
    pageNumber: number
}

export interface Issue{
    id: string;
    issue_number: number;
    driver: string;
    date: string;
    synopsis: string;
    subsystems: string[];
    description: string;
    priority: string;
    status: string;
}

export interface PackingList {
    id: string;
    name: string;
    description: string;
    items: string[];
}

export interface PackingListEntry {
    packingListId: string;
    checkedItems: number[];
}

export interface DrivingDay {
    id: string;
    dayNumber: number;
    title: string;
    date: string;
    description: string;
    driverIds: string[];
    packingLists: PackingListEntry[];
    issueIds: string[];
    feedback: string[];
}

export const MOCK_PACKING_LISTS: PackingList[] = [
  {
    id: "pl1",
    name: "Standard Track Day",
    description: "Everything needed for a full day at the track",
    items: [
      "Fire extinguisher",
      "First aid kit",
      "Tool chest",
      "Tire warmers",
      "Spare tire set",
      "Fuel jugs (x2)",
      "Helmet(s)",
      "Driver suits",
      "Data logging laptop",
      "Pop-up tent",
      "Folding table & chairs",
      "Battery charger",
      "Jack & jack stands",
      "Rain canopy",
    ],
  },
  {
    id: "pl2",
    name: "Minimal Shakedown",
    description: "Bare essentials for a quick shakedown run",
    items: [
      "Fire extinguisher",
      "First aid kit",
      "Helmet(s)",
      "Driver suits",
      "Tool chest",
      "Battery charger",
    ],
  },
];



