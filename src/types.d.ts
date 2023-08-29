
export interface Ticket {
    name: string;
    text: string;
    count: number;
}

export interface ScrapperData {
    url: string;
    tabs: number;
    refreshMs: number;
    tickets: Array<Ticket>;
}