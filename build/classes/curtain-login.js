"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.CurtainWebAPI = void 0;
const base = "https://celsus.muttsu.xyz/";
const axios_1 = __importStar(require("axios"));
class CurtainWebAPI {
    constructor(baseURL = base) {
        this.loginURL = "";
        this.logoutURL = "";
        this.refereshURL = "";
        this.orcidLoginURL = "";
        this.userInfoURL = "";
        this.user = new User();
        this.isRefreshing = false;
        this.axiosInstance = axios_1.default.create();
        this.loginURL = baseURL + "token/";
        this.logoutURL = baseURL + "logout/";
        this.refereshURL = baseURL + "token/refresh/";
        this.orcidLoginURL = baseURL + "rest-auth/orcid/";
        this.userInfoURL = baseURL + "user/";
        this.axiosInstance.interceptors.request.use((config) => {
            if (config.url === this.logoutURL || config.url === this.userInfoURL) {
                config.headers["Authorization"] = "Bearer " + this.user.access_token;
            }
            config.baseURL;
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        this.axiosInstance.interceptors.response.use((response) => {
            return response;
        }, (error) => {
            if (error.response.status === 401) {
                if (error.config.url !== this.refereshURL &&
                    error.config.url !== this.loginURL &&
                    error.config.url !== this.orcidLoginURL) {
                    if (!this.checkIfRefreshTokenExpired()) {
                        if (!this.isRefreshing) {
                            return this.refresh().then((response) => {
                                return this.axiosInstance.request(error.config);
                            }).catch((error) => {
                                this.isRefreshing = false;
                                this.user = new User();
                                return error;
                            });
                        }
                    }
                }
            }
            return Promise.reject(error);
        });
    }
    login(username, password) {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        headers["withCredentials"] = "true";
        return this.axiosInstance.post(this.loginURL, { username, password }, { headers: headers, responseType: "json" }).then((response) => {
            this.user.access_token = response.data.access;
            this.user.refresh_token = response.data.refresh;
            this.user.loginStatus = true;
            return this.getUserInfo();
        });
    }
    getUserInfo() {
        const headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.post(this.userInfoURL, {}, { headers: headers, responseType: "json" }).then((response) => {
            this.user.canDelete = response.data.can_delete;
            this.user.id = response.data.id;
            this.user.username = response.data.username;
            this.user.isStaff = response.data.is_staff;
            this.user.curtainLinkLimit = response.data.curtain_link_limit;
            this.user.totalCurtain = response.data.total_curtain;
            this.user.curtainLinkLimitExceeded = response.data.curtain_link_limit_exceeded;
            return response.data;
        });
    }
    logout() {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.post(this.logoutURL, { refresh: this.user.refresh_token }, { headers: headers, responseType: "json" }).then((response) => {
            this.user = new User();
            return response;
        });
    }
    refresh() {
        this.isRefreshing = true;
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.post(this.refereshURL, { refresh: this.user.refresh_token }, { headers: headers, responseType: "json" }).then((response) => {
            this.user.access_token = response.data.access;
            this.user.loginStatus = true;
            return response;
        });
    }
    ORCIDLogin(authorizationCode, redirectURI) {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.post(this.orcidLoginURL, JSON.stringify({ "auth_token": authorizationCode, "redirect_uri": redirectURI + "/" }), { headers: headers, responseType: "json" }).then((response) => {
            this.user.access_token = response.data.access;
            this.user.refresh_token = response.data.refresh;
            this.user.loginStatus = true;
            return response;
        }).then((response) => {
            return this.getUserInfo();
        });
    }
    checkIfRefreshTokenExpired() {
        let now = new Date();
        let diff = (now.getTime() - this.user.lastRefreshTokenUpdate.getTime()) / 1000;
        diff = diff / 60 / 60;
        return 24 > Math.abs(Math.round(diff));
    }
}
exports.CurtainWebAPI = CurtainWebAPI;
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
    }
}
exports.User = User;
