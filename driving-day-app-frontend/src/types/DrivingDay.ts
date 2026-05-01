import { PackingListEntry } from "./PackingList";
export interface DrivingDay {
    id: string;
    dayNumber: number;
    title: string;
    date: string;
    description: string;
    /** 
     * List of driver names for display purposes 
     */
    drivers: string[];
    /** 
     * List of driver IDs 
     */
    driverIds: string[];
    packingLists: PackingListEntry[];
    /** 
     * Array of feedback entry IDs 
     */
    feedback: string[];
    /** 
     * Array of issue IDs or issue numbers 
     */
    issues: string[];
}