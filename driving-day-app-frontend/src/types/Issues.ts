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