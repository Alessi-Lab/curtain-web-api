"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const pouchdb_1 = __importDefault(require("pouchdb"));
class User {
    get refresh_token() {
        return this._refresh_token;
    }
    set refresh_token(value) {
        this.lastRefreshTokenUpdate = new Date();
        this._refresh_token = value;
    }
    get access_token() {
        return this._access_token;
    }
    set access_token(value) {
        this.lastAccessTokenUpdate = new Date();
        this._access_token = value;
    }
    constructor() {
        this._refresh_token = "";
        this._access_token = "";
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
        this.db = new pouchdb_1.default("curtainuser");
    }
    init() {
        return this.db.get("user").then((doc) => {
            return this.loadFromDB();
        }).catch((error) => {
            if (error.name === "not_found") {
                return this.initiateDB();
            }
        });
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
        });
    }
    updateDB() {
        return this.db.get("user").then((doc) => {
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
            });
        }).then((response) => {
        }).catch((error) => {
            console.log(error);
        });
    }
    saveIntoDB() {
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
            console.log(response);
        }).catch((error) => {
            console.log(error);
        });
    }
    loadFromDB() {
        return this.db.get("user").then((doc) => {
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
            this.reset();
            this.db = new pouchdb_1.default("curtainuser");
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
exports.User = User;
