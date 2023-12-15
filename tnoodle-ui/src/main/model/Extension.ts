export interface Extendable {
    extensions: Extension[];
}

export interface Extension {
    id: string;
    specUrl: string;
    data: any;
}
