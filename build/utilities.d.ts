export declare function getProteomicsData(acc: string, tissueType: string): Promise<import("axios").AxiosResponse<any, any>>;
export declare function getPrideData(acc: string): Promise<import("axios").AxiosResponse<any, any>>;
export declare function getEBIAlpha(id: string): Promise<import("axios").AxiosResponse<any, any>>;
export declare function getStringDBInteractions(genes: string[], organism: string, score?: number, networkType?: string): Promise<import("axios").AxiosResponse<any, any>>;
export declare function getInteractomeAtlas(genes: string[], filterParameter?: string): Promise<any>;
