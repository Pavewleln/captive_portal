export interface IPostDataRequest {
    username: string;
    password: string;
    mac?: string;
    role: string;
}

export interface IPatchDataRequest {
    username: string;
    radcheck: Record<string, string>;
    macs: Record<string, string>;
}