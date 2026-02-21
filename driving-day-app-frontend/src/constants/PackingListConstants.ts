export interface PackingItem{
    label: string;
    checked: boolean;

}

export interface PackingTemplate{
    id: string
    name: string;
    description: string;
    items: PackingItem[];
}

export const defaultTemplates: PackingTemplate[] = [
    {
        id: "saftey",
        name: "Saftey",
        description: "Saftey and medical essentials",
        items: [
            { label: "item1", checked: false},
            { label: "item2", checked: false},
            { label: "item3", checked: false},
            { label: "item4", checked: false},

           
        ],
    },
    {
        id: "tools",
        name: "Tools",
        description: "workshop and trackside tools",
        items: [
            { label: "item1", checked: false},
            { label: "item2", checked: false},
            { label: "item3", checked: false},
            { label: "item4", checked: false},

           
        ], 
    },

];