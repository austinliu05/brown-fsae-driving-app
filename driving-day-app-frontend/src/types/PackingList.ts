export interface PackingListEntry {
    packingListId: string;
    checkedItems: number[];
}

export interface PackingList {
    id: string;
    name: string;
    description: string;
    items: string[];
    category?: PackingCategory;
    order?: number;
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
