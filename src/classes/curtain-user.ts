import PouchDB from "pouchdb";

export class User {
    get refresh_token(): string {
        return this._refresh_token;
    }

    set refresh_token(value: string) {
        this.lastRefreshTokenUpdate = new Date();
        this._refresh_token = value;
    }

    get access_token(): string {
        return this._access_token;
    }

    set access_token(value: string) {
        this.lastAccessTokenUpdate = new Date();
        this._access_token = value;
    }

    private _refresh_token: string = "";
    private _access_token: string = "";
    username: string = "";
    loginStatus: boolean = false;
    isStaff: boolean = false;
    id: number = 0;
    totalCurtain: number = 0;
    canDelete: boolean = false;
    curtainLinkLimit: number = 0;
    curtainLinkLimitExceeded: boolean = false;
    lastAccessTokenUpdate: Date = new Date();
    lastRefreshTokenUpdate: Date = new Date();
    db = new PouchDB("curtainuser");

    constructor() {

    }

    init() {
        return this.db.get("user").then((doc: any) => {
            return this.loadFromDB();
        }).catch((error) => {
            if (error.name === "not_found") {
                return this.initiateDB()
            }
        })
    }

    initiateDB() {
        return this.db.put({
            _id: "user",
            access_token: this.access_token,
            refresh_token: this.refresh_token,
            username: this.username,
            loginStatus: this.loginStatus,
            isStaff: this.isStaff,
            id: this.id,
            totalCurtain: this.totalCurtain,
            canDelete: this.canDelete,
            curtainLinkLimit: this.curtainLinkLimit,
            curtainLinkLimitExceeded: this.curtainLinkLimitExceeded,
            lastAccessTokenUpdate: this.lastAccessTokenUpdate,
            lastRefreshTokenUpdate: this.lastRefreshTokenUpdate
        }).then((response) => {

        }).catch((error) => {
        })

    }

    updateDB() {
        return this.db.get("user").then((doc: any) => {
            return this.db.put({
                _id: "user",
                _rev: doc._rev,
                access_token: this.access_token,
                refresh_token: this.refresh_token,
                username: this.username,
                loginStatus: this.loginStatus,
                isStaff: this.isStaff,
                id: this.id,
                totalCurtain: this.totalCurtain,
                canDelete: this.canDelete,
                curtainLinkLimit: this.curtainLinkLimit,
                curtainLinkLimitExceeded: this.curtainLinkLimitExceeded,
                lastAccessTokenUpdate: this.lastAccessTokenUpdate,
                lastRefreshTokenUpdate: this.lastRefreshTokenUpdate
            })
        }).then((response) => {

        }).catch((error) => {
            console.log(error);
        });
    }

    saveIntoDB(accessToken: string, refreshToken: string) {
        this.access_token = accessToken;
        this.refresh_token = refreshToken;
        this.loginStatus = true;
        return this.db.get("user").catch((error) => {
          if (error.name === "not_found") {
            return {
                _id: "user",
                access_token: accessToken,
                refresh_token: refreshToken,
                username: this.username,
                loginStatus: true,
                isStaff: this.isStaff,
                id: this.id,
                totalCurtain: this.totalCurtain,
                canDelete: this.canDelete,
                curtainLinkLimit: this.curtainLinkLimit,
                curtainLinkLimitExceeded: this.curtainLinkLimitExceeded,
                lastAccessTokenUpdate: this.lastAccessTokenUpdate,
                lastRefreshTokenUpdate: this.lastRefreshTokenUpdate
            }
          } else {
            throw error
          }
        }).then((doc: any) => {
            console.log(accessToken, refreshToken)
            return this.db.put({
                _id: "user",
                _rev: doc._rev,
                access_token: accessToken,
                refresh_token: refreshToken,
                username: this.username,
                loginStatus: true,
                isStaff: this.isStaff,
                id: this.id,
                totalCurtain: this.totalCurtain,
                canDelete: this.canDelete,
                curtainLinkLimit: this.curtainLinkLimit,
                curtainLinkLimitExceeded: this.curtainLinkLimitExceeded,
                lastAccessTokenUpdate: this.lastAccessTokenUpdate,
                lastRefreshTokenUpdate: this.lastRefreshTokenUpdate
            })
        })
    }

    loadFromDB() {
        return this.db.get("user").then((doc: any) => {
            this.access_token = doc.access_token;
            this.refresh_token = doc.refresh_token;
            this.username = doc.username;
            this.loginStatus = doc.loginStatus;
            this.isStaff = doc.isStaff;
            this.id = doc.id;
            this.totalCurtain = doc.totalCurtain;
            this.canDelete = doc.canDelete;
            this.curtainLinkLimit = doc.curtainLinkLimit;
            this.curtainLinkLimitExceeded = doc.curtainLinkLimitExceeded;
            this.lastAccessTokenUpdate = new Date(doc.lastAccessTokenUpdate);
            this.lastRefreshTokenUpdate = new Date(doc.lastRefreshTokenUpdate);
        }).catch((error) => {
            console.log(error);
        });
    }

    clearDB() {
        return this.db.destroy().then((response) => {
            this.reset()
            this.db = new PouchDB("curtainuser");
            return this.initiateDB();
        }).catch((error) => {
            console.log(error);
        });
    }

    reset() {
        this.access_token = "";
        this.refresh_token = "";
        this.username = "";
        this.loginStatus = false;
        this.isStaff = false;
        this.id = 0;
        this.totalCurtain = 0;
        this.canDelete = false;
        this.curtainLinkLimit = 0;
        this.curtainLinkLimitExceeded = false;
        this.lastAccessTokenUpdate = new Date();
        this.lastRefreshTokenUpdate = new Date();
    }
}