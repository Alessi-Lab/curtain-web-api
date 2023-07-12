export declare class CurtainWebAPI {
    loginURL: string;
    logoutURL: string;
    refereshURL: string;
    orcidLoginURL: string;
    userInfoURL: string;
    user: User;
    isRefreshing: boolean;
    axiosInstance: import("axios").AxiosInstance;
    constructor(baseURL?: string);
    login(username: string, password: string): Promise<any>;
    getUserInfo(): Promise<any>;
    logout(): Promise<import("axios").AxiosResponse<any, any>>;
    refresh(): Promise<import("axios").AxiosResponse<any, any>>;
    ORCIDLogin(authorizationCode: string, redirectURI: string): Promise<any>;
    checkIfRefreshTokenExpired(): boolean;
}
export declare class User {
    get refresh_token(): string;
    set refresh_token(value: string);
    get access_token(): string;
    set access_token(value: string);
    private _refresh_token;
    private _access_token;
    username: string;
    loginStatus: boolean;
    isStaff: boolean;
    id: number;
    totalCurtain: number;
    canDelete: boolean;
    curtainLinkLimit: number;
    curtainLinkLimitExceeded: boolean;
    lastAccessTokenUpdate: Date;
    lastRefreshTokenUpdate: Date;
    constructor();
}
