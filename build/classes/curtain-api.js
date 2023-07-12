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
exports.CurtainWebAPI = exports.reviver = exports.replacer = void 0;
const curtain_user_1 = require("./curtain-user");
const axios_1 = __importStar(require("axios"));
const base = "https://celsus.muttsu.xyz/";
const replacer = (key, value) => {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    }
    else {
        return value;
    }
};
exports.replacer = replacer;
const reviver = (key, value) => {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
};
exports.reviver = reviver;
class CurtainWebAPI {
    constructor(baseURL = base) {
        this.loginURL = "";
        this.logoutURL = "";
        this.refereshURL = "";
        this.orcidLoginURL = "";
        this.userInfoURL = "";
        this.user = new curtain_user_1.User();
        this.isRefreshing = false;
        this.axiosInstance = axios_1.default.create();
        this.baseURL = base;
        this.baseURL = baseURL;
        this.loginURL = baseURL + "token/";
        this.logoutURL = baseURL + "logout/";
        this.refereshURL = baseURL + "token/refresh/";
        this.orcidLoginURL = baseURL + "rest-auth/orcid/";
        this.userInfoURL = baseURL + "user/";
        this.axiosInstance.interceptors.request.use((config) => {
            if (config.url) {
                /*if (!this.checkIfRefreshTokenExpired() && this.user.loginStatus) {
                    if (config.url !== this.refereshURL &&
                        config.url !== this.loginURL &&
                        config.url !== this.orcidLoginURL) {
                        if (!this.checkIfRefreshTokenExpired() && this.user.loginStatus) {
                            console.log("refreshing token")
                            if (!this.isRefreshing) {
                                return this.refresh().then((response) => {
                                    this.isRefreshing = false;
                                    return this.axiosInstance.request(config);
                                }).catch((error) => {
                                    this.isRefreshing = false;
                                    this.user = new User();
                                    return error;
                                });
                            }
                        }
                    }
                } else {
                    this.user = new User();
                }*/
                if (
                //config.url === this.refereshURL ||
                config.url === this.logoutURL ||
                    config.url === this.userInfoURL ||
                    config.url.startsWith(this.baseURL + "curtain/") ||
                    config.url.startsWith(this.baseURL + "data_filter_list/")) {
                    if (this.user.loginStatus) {
                        config.headers["Authorization"] = "Bearer " + this.user.access_token;
                    }
                }
            }
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
                    if (!this.checkIfRefreshTokenExpired() && this.user.loginStatus) {
                        console.log("refreshing token");
                        if (!this.isRefreshing) {
                            return this.refresh().then((response) => {
                                this.isRefreshing = false;
                                return this.axiosInstance.request(error.config);
                            }).catch((error) => {
                                this.isRefreshing = false;
                                this.user = new curtain_user_1.User();
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
            this.user.saveIntoDB().then();
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
            return this.user.updateDB().then((response) => {
                return this.user;
            });
        });
    }
    logout() {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.post(this.logoutURL, { refresh_token: this.user.refresh_token }, { headers: headers, responseType: "json" }).then((response) => {
            return this.user.clearDB();
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
        return this.axiosInstance.post(this.orcidLoginURL, JSON.stringify({ "auth_token": authorizationCode, "redirect_uri": redirectURI }), { headers: headers, responseType: "json" }).then((response) => {
            this.user.access_token = response.data.access;
            this.user.refresh_token = response.data.refresh;
            this.user.loginStatus = true;
            console.log(this.user);
        }).then((response) => {
            return this.getUserInfo();
        });
    }
    checkIfRefreshTokenExpired() {
        let now = new Date();
        let diff = (now.getTime() - this.user.lastRefreshTokenUpdate.getTime()) / 1000;
        diff = diff / 60 / 60;
        return 24 <= Math.abs(Math.round(diff));
    }
    deleteCurtainLink(curtainLinkID) {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.delete(this.baseURL + "curtain/" + curtainLinkID + "/", { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    putSettings(settings, enable = true, description = "", sessionType = "TP", onUploadProgress = undefined) {
        let form = new FormData();
        form.append("file", new Blob([JSON.stringify(settings, exports.replacer)], { type: 'text/json' }), "curtain-settings.json");
        if (enable) {
            form.append("enable", "True");
        }
        else {
            form.append("enable", "False");
        }
        form.append("description", description);
        form.append("curtain_type", sessionType);
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "multipart/form-data";
        if (onUploadProgress !== undefined) {
            return this.axiosInstance.post(this.baseURL + "curtain/", form, { headers: headers, responseType: "json", onUploadProgress: onUploadProgress }).then((response) => {
                return response;
            });
        }
        return this.axiosInstance.post(this.baseURL + "curtain/", form, { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    postSettings(id, token, onDownloadProgress = undefined) {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        if (onDownloadProgress !== undefined) {
            return this.axiosInstance.get(this.baseURL + "curtain/" + id + "/download/token=" + token + "/", { responseType: "json", onDownloadProgress: onDownloadProgress }).then((response) => {
                return response;
            });
        }
        return this.axiosInstance.get(this.baseURL + "curtain/" + id + "/download/token=" + token + "/", { responseType: "json" }).then((response) => {
            return response;
        });
    }
    getPrideData(accession) {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        return axios_1.default.get("https://www.ebi.ac.uk/pride/ws/archive/v2/projects/" + accession, { responseType: "json" }).then((response) => {
            return response;
        });
    }
    generateTemporarySession(linkId, lifetime) {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.post(this.baseURL + "curtain/" + linkId + "/generate_token", { lifetime: lifetime }, { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    updateSession(sessionData, linkId) {
        let payload = new FormData();
        if ("file" in sessionData) {
            payload.append("file", new Blob([JSON.stringify(sessionData["file"], exports.replacer)], { type: 'text/json' }), "curtain-settings.json");
            payload.append("description", sessionData["file"]["settings"]["description"]);
        }
        if ("enable" in sessionData) {
            if (sessionData["enable"]) {
                payload.append("enable", "True");
            }
            else {
                payload.append("enable", "False");
            }
        }
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "multipart/form-data";
        return this.axiosInstance.patch(this.baseURL + "curtain/" + linkId + "/", payload, { responseType: "json" }).then((response) => {
            return response;
        });
    }
    getSessionSettings(linkId) {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.get(this.baseURL + "curtain/" + linkId + "/", { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    getOwnership(linkId) {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.get(this.baseURL + "curtain/" + linkId + "/get_ownership/", { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    getOwners(linkId) {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.get(this.baseURL + "curtain/" + linkId + "/get_owners/", { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    addOwner(linkId, owner) {
        let form = new FormData();
        form.append("username", owner);
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "multipart/form-data";
        return this.axiosInstance.patch(this.baseURL + "curtain/" + linkId + "/add_owner/", form, { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    getCurtainLinks(username, sessionDescription = "", offset = 0, sessionType = "TP") {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        let params = new URLSearchParams();
        params.append("username", username);
        params.append("description", sessionDescription);
        params.append("offset", offset.toString());
        params.append("curtain_type", sessionType);
        params.append("ordering", "-created");
        return this.axiosInstance.get(this.baseURL + "curtain/", { headers: headers, params: params, responseType: "json" }).then((response) => {
            return response;
        });
    }
    getSiteProperties() {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.get(this.baseURL + "site-properties/", { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    saveDataFilterList(name, data, category = "") {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.post(this.baseURL + "data_filter_list/", { name: name, data: data, category: category }, { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    getDataFilterListByID(id) {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.get(this.baseURL + "data_filter_list/" + id + "/", { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    getDataFilterList(title = "", searchTerm = "", category = "", limit = 99999999) {
        let params = new URLSearchParams();
        if (title != "") {
            params.append("name", title);
        }
        if (searchTerm != "" && searchTerm != undefined) {
            params.append("data", searchTerm);
        }
        if (category != "" && category != undefined) {
            params.append("category", category);
        }
        params.append("limit", limit.toString());
        return this.axiosInstance.get(this.baseURL + "data_filter_list/", { responseType: "json", params });
    }
    getDataFilterListByCategory(category) {
        let params = new URLSearchParams();
        params.append("category_exact", category);
        return this.axiosInstance.get(this.baseURL + "data_filter_list/", { responseType: "json", params });
    }
    deleteDataFilterList(id) {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.delete(this.baseURL + "data_filter_list/" + id + "/", { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    downloadStats() {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        return axios_1.default.get(this.baseURL + "stats/download/", { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    postInteractomeAtlasProxy(genes, filterParameter) {
        let params = new URLSearchParams();
        params.append("query_interactors", "query");
        params.append("query_id_array", genes.join("%2C"));
        params.append("search_term_parameter", genes.join("%2C"));
        params.append("filter_parameter", filterParameter);
        let searchTermArray = [];
        for (const g of genes) {
            searchTermArray.push("search_term_array%5B%5D=" + g);
        }
        const data = "http://www.interactome-atlas.org/search_results_interactions?" + params.toString() + "&" + searchTermArray.join("&");
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return axios_1.default.post(this.baseURL + "interactome-atlas-proxy/", { link: data }, { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    postPrimitiveStatsTest(data, type = "t-test") {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return axios_1.default.post(this.baseURL + "primitive-stats-test/", { data, type }, { headers: headers, responseType: "json" }).then((response) => {
            return response;
        });
    }
    getDataAllListCategory() {
        let headers = new axios_1.AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return axios_1.default.get(this.baseURL + "data_filter_list/get_all_category/", { headers: headers, responseType: "json" }).then((response) => { return response; });
    }
}
exports.CurtainWebAPI = CurtainWebAPI;
