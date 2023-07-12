/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-core" />
/// <reference types="pouchdb-mapreduce" />
/// <reference types="pouchdb-replication" />
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
    db: PouchDB.Database<{}>;
    constructor();
    init(): Promise<void | undefined>;
    initiateDB(): Promise<void>;
    updateDB(): Promise<void>;
    saveIntoDB(): Promise<void>;
    loadFromDB(): Promise<void>;
    clearDB(): Promise<void>;
    reset(): void;
}
