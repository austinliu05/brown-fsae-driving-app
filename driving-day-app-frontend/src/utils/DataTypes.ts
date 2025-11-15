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


// Likert-style response used across feedback forms
export type Likert = 'no' | 'somewhat' | 'yes' | 'n/a'

export interface Feedback {
    id: string;
    feedback_number: number;
    driver: string;
    synopsis: string;
    date: string;
    responses: Record<string, Likert>;
    comments?: string; 
}



