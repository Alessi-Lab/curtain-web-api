import {User} from "./curtain-user";
import axios, {AxiosHeaders} from "axios";

const base: string = "https://celsus.muttsu.xyz/"

export const replacer = (key: any, value: any) => {
    if(value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}

export const reviver = (key: any, value: any) => {
    if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

export class CurtainWebAPI {
    loginURL: string = "";
    logoutURL: string = "";
    refereshURL: string = "";
    orcidLoginURL: string = "";
    userInfoURL: string = "";
    curtainURL: string = "";
    user: User = new User();
    isRefreshing: boolean = false;
    axiosInstance = axios.create()
    baseURL: string = base

    constructor(baseURL: string = base) {
        this.baseURL = baseURL
        this.loginURL = baseURL + "token/";
        this.logoutURL = baseURL + "logout/";
        this.refereshURL = baseURL + "token/refresh/";
        this.orcidLoginURL = baseURL + "rest-auth/orcid/";
        this.userInfoURL = baseURL + "user/";
        this.curtainURL = baseURL + "curtain/"
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
                    config.url.startsWith(this.curtainURL) ||
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
            return response
        } , (error) => {
            if (error.response.status === 401) {
                if (error.config.url !== this.refereshURL &&
                    error.config.url !== this.loginURL &&
                    error.config.url !== this.orcidLoginURL) {
                    if (!this.checkIfRefreshTokenExpired() && this.user.loginStatus) {
                        console.log("refreshing token")
                        if (!this.isRefreshing) {
                            return this.refresh().then((response) => {
                                this.isRefreshing = false;
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

    login(username: string, password: string) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        headers["withCredentials"] = "true";
        return this.axiosInstance.post(this.loginURL, {username, password}, {headers: headers, responseType:"json"}).then((response) => {
            this.user.loginStatus = true;
            return this.user.saveIntoDB(response.data.access, response.data.refresh).then((response) => {
              return this.getUserInfo()
            })
        });
    }

    getUserInfo() {
        const headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        console.log(this.user)

        return this.axiosInstance.post(this.userInfoURL, {}, {headers: headers, responseType: "json"}).then((response) => {
            this.user.canDelete = response.data.can_delete;
            this.user.id = response.data.id;
            this.user.username = response.data.username;
            this.user.isStaff = response.data.is_staff;
            this.user.curtainLinkLimit = response.data.curtain_link_limit;
            this.user.totalCurtain = response.data.total_curtain;
            this.user.curtainLinkLimitExceeded = response.data.curtain_link_limit_exceeded;
            return this.user.updateDB().then((response) => {
                console.log(this.user)
                return this.user;
            });

        })
    }

    logout() {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.post(this.logoutURL, {refresh_token: this.user.refresh_token}, {headers: headers, responseType:"json"}).then((response) => {
            return this.user.clearDB();
        });
    }

    refresh() {
        this.isRefreshing = true;
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.post(this.refereshURL, {refresh: this.user.refresh_token}, {headers: headers, responseType:"json"}).then((response) => {
            this.user.access_token = response.data.access;
            this.user.loginStatus = true;
            return response;
        });
    }

    ORCIDLogin(authorizationCode: string, redirectURI: string){
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.user.loadFromDB().then(
            (response) => {
                console.log(this.user)
                return this.axiosInstance.post(this.orcidLoginURL, JSON.stringify({"auth_token": authorizationCode, "redirect_uri": redirectURI}), {headers: headers, responseType:"json"}).then((response) => {
                    return this.user.saveIntoDB(response.data.access, response.data.refresh).then((response) => {
                      console.log(this.user)
                        return this.getUserInfo()
                    })
                })
            }
        )
    }

    checkIfRefreshTokenExpired() {
        let now = new Date();
        let diff = (now.getTime() - this.user.lastRefreshTokenUpdate.getTime()) / 1000;
        diff = diff/60/60;
        return 24 <= Math.abs(Math.round(diff));
    }

    deleteCurtainLink(curtainLinkID: string) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.delete(this.baseURL + "curtain/" + curtainLinkID + "/", {headers: headers, responseType:"json"}).then((response) => {
            return response;
        });
    }


    putSettings(settings: any, enable: boolean = true, description: string = "", sessionType: string = "TP", onUploadProgress: any = undefined) {
        let form: FormData = new FormData();
        form.append("file", new Blob([JSON.stringify(settings, replacer)], {type: 'text/json'}), "curtain-settings.json")
        if (enable) {
            form.append("enable", "True")
        } else {
            form.append("enable", "False")
        }
        form.append("description", description)
        form.append("curtain_type", sessionType)
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "multipart/form-data";
        if (onUploadProgress !== undefined) {
            return this.axiosInstance.post(this.baseURL + "curtain/", form, {headers: headers, responseType:"json", onUploadProgress: onUploadProgress}).then((response) => {
                return response;
            });
        }
        return this.axiosInstance.post(this.baseURL + "curtain/", form, {headers: headers, responseType:"json"}).then((response) => {
            return response;
        });
    }

    postSettings(id: string, token: string, onDownloadProgress: any = undefined) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        if (onDownloadProgress !== undefined) {
            return this.axiosInstance.get(this.baseURL + "curtain/" + id + "/download/token=" + token + "/", {responseType:"json"}).then((response) => {
                if ("url" in response.data) {
                    return this.axiosInstance.get(response.data.url, {responseType: "json", onDownloadProgress: onDownloadProgress}).then((response) => {
                        return response;
                    })
                } else {
                    return response;
                }
            })
        }
        return this.axiosInstance.get(this.baseURL + "curtain/" + id + "/download/token=" + token + "/", {responseType:"json"}).then((response) => {
            return response;
        })
    }

    getPrideData(accession: string) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";

        return axios.get("https://www.ebi.ac.uk/pride/ws/archive/v2/projects/"+accession, {responseType: "json"}).then((response) => {
            return response;
        });
    }

    generateTemporarySession(linkId: string, lifetime: number) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.post(this.baseURL + "curtain/" + linkId + "/generate_token/", {lifetime: lifetime}, {headers: headers, responseType:"json"}).then((response) => {
            return response;
        });
    }

    updateSession(sessionData: any, linkId: string) {
        let payload: FormData = new FormData();
        if ("file" in sessionData) {
            payload.append("file", new Blob([JSON.stringify(sessionData["file"], replacer)], {type: 'text/json'}), "curtain-settings.json")
            payload.append("description", sessionData["file"]["settings"]["description"])
        }
        if ("enable" in sessionData) {
            if (sessionData["enable"]) {
                payload.append("enable", "True")
            } else {
                payload.append("enable", "False")
            }
        }

        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "multipart/form-data";

        return this.axiosInstance.patch(this.baseURL + "curtain/" + linkId + "/", payload, {responseType:"json"}).then((response) => {
            return response;
        });
    }

    getSessionSettings(linkId: string) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.get(this.baseURL + "curtain/" + linkId + "/", {headers: headers, responseType:"json"}).then((response) => {
            return response;
        });
    }

    getOwnership(linkId: string) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.get(this.baseURL + "curtain/" + linkId + "/get_ownership/", {headers: headers, responseType:"json"}).then((response) => {
            return response;
        });
    }

    getOwners(linkId: string) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.get(this.baseURL + "curtain/" + linkId + "/get_owners/", {headers: headers, responseType:"json"}).then((response) => {
            return response;
        });
    }

    addOwner(linkId: string, owner: string) {
        let form = new FormData();
        form.append("username", owner);

        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "multipart/form-data";

        return this.axiosInstance.patch(this.baseURL + "curtain/" + linkId + "/add_owner/", form, {headers: headers, responseType:"json"}).then((response) => {
            return response;
        })
    }

    getCurtainLinks(username: string, sessionDescription: string = "", offset: number = 0, sessionType: string = "TP") {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        let params: URLSearchParams = new URLSearchParams();
        params.append("username", username);
        params.append("description", sessionDescription);
        params.append("offset", offset.toString());
        params.append("curtain_type", sessionType);
        params.append("ordering", "-created");
        return this.axiosInstance.get(this.baseURL + "curtain/", {headers: headers, params: params, responseType:"json"}).then((response) => {
            return response;
        });
    }

    getSiteProperties() {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.get(this.baseURL + "site-properties/", {headers: headers, responseType:"json"}).then((response) => {
            return response;
        });
    }

    saveDataFilterList(name: string, data: string, category: string = "") {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.post(this.baseURL + "data_filter_list/", {name: name, data: data, category: category}, {headers: headers, responseType:"json"}).then((response) => {
            return response;
        });
    }

    getDataFilterListByID(id: number) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.get(this.baseURL + "data_filter_list/" + id + "/", {headers: headers, responseType:"json"}).then((response) => {
            return response;
        });
    }

    getDataFilterList(
        title: string = "",
        searchTerm: string = "",
        category: string = "",
        limit: number = 99999999
    ) {
        let params = new URLSearchParams();
        if (title != "") {
            params.append("name", title)
        }
        if (searchTerm != "" && searchTerm != undefined) {
            params.append("data", searchTerm)
        }
        if (category != "" && category != undefined) {
            params.append("category", category)
        }

        params.append("limit", limit.toString())
        return this.axiosInstance.get(this.baseURL + "data_filter_list/", {responseType:"json", params})
    }

    getDataFilterListByCategory(category: string) {
        let params = new URLSearchParams();
        params.append("category_exact", category)
        return this.axiosInstance.get(this.baseURL + "data_filter_list/", {responseType:"json", params})
    }

    deleteDataFilterList(id: number) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        return this.axiosInstance.delete(this.baseURL + "data_filter_list/" + id + "/", {headers: headers, responseType:"json"}).then((response) => {
            return response;
        });
    }

    downloadStats() {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        return axios.get(this.baseURL + "stats/download/", {headers: headers, responseType: "json"}).then((response) => {
            return response;
        });
    }

    postInteractomeAtlasProxy(genes: string[], filterParameter: string) {
        let params = new URLSearchParams();
        params.append("query_interactors", "query");
        params.append("query_id_array", genes.join("%2C"));
        params.append("search_term_parameter", genes.join("%2C"));
        params.append("filter_parameter", filterParameter);
        let searchTermArray: string[] = []
        for (const g of genes) {
            searchTermArray.push("search_term_array%5B%5D="+g)
        }
        const data = "http://www.interactome-atlas.org/search_results_interactions?" + params.toString() + "&" + searchTermArray.join("&")
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return axios.post(this.baseURL + "interactome-atlas-proxy/", {link: data}, {headers: headers, responseType: "json"}).then((response) => {
            return response;
        });
    }

    postPrimitiveStatsTest(data: any, type: string = "t-test") {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return axios.post(this.baseURL + "primitive-stats-test/", {data,type},  ).then((response) => {
            return response;
        });
    }

    getDataAllListCategory() {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return axios.get(this.baseURL + "data_filter_list/get_all_category/", {headers: headers, responseType: "json"}).then((response) => {return response;});
    }

    postCompareSession(idList: string[], matchType: string, studyList: string[], sessionId: string) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return axios.post(this.baseURL + "compare-session/", {matchType, studyList, idList, sessionId}, {headers: headers, responseType: "json"}).then((response) => {return response;});
    }

    getStatsSummary(lastNDays: number) {
        let headers = new AxiosHeaders();
        headers["Accept"] = "application/json";
        headers["Content-Type"] = "application/json";
        return this.axiosInstance.get(this.baseURL + `stats/summary/${lastNDays}/`, {responseType:"json", headers})
    }
}

