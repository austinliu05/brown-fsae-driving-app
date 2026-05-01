export type ResponseValue = string | string[];

export interface Feedback {
    id: string;
    feedback_number: number;
    driver: string;
    date: string;
    responses: Record<string, ResponseValue>;
}

export type QType = 'yesOther' | 'noOther' | 'text' | 'multi';
