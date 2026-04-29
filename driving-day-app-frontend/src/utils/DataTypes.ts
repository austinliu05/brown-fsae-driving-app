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
    drivers: string[];
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
    category?: PackingCategory;
    order?: number;
}

export type PackingCategory = "Standard" | "Subsystems";

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
  drivers: string[];
    packingLists: PackingListEntry[];
    feedback: string[];
}

export const isStandardPackingList = (packingList: PackingList) =>
    (packingList.category ?? "").trim().toLowerCase() === "standard" ||
    packingList.name.trim().toLowerCase() === "general";

export const getDefaultPackingListIds = (packingLists: PackingList[]) =>
    packingLists.filter(isStandardPackingList).map((packingList) => packingList.id);

export const sortPackingListsForDisplay = (packingLists: PackingList[]) =>
    [...packingLists].sort((left, right) => {
        const leftIsStandard = isStandardPackingList(left);
        const rightIsStandard = isStandardPackingList(right);

        if (leftIsStandard !== rightIsStandard) {
            return leftIsStandard ? -1 : 1;
        }

        const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
        if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
        }

        return left.name.localeCompare(right.name);
    });

export type ResponseValue = string | string[];

export interface Feedback {
    id: string;
    feedback_number: number;
    driver: string;
    date: string;
    responses: Record<string, ResponseValue>;
}

export type QType = 'yesOther' | 'noOther' | 'text' | 'multi';


