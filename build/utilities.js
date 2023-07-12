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
exports.getInteractomeAtlas = exports.getStringDBInteractions = exports.getEBIAlpha = exports.getPrideData = exports.getProteomicsData = void 0;
const axios_1 = __importStar(require("axios"));
function getProteomicsData(acc, tissueType) {
    let headers = new axios_1.AxiosHeaders();
    headers["Accept"] = "application/json";
    headers["Content-Type"] = "application/json";
    return axios_1.default.get("https://www.proteomicsdb.org/proteomicsdb/logic/api/proteinexpression.xsodata/InputParams(PROTEINFILTER='" + acc + "',MS_LEVEL=1,TISSUE_ID_SELECTION='',TISSUE_CATEGORY_SELECTION='" + tissueType + "',SCOPE_SELECTION=1,GROUP_BY_TISSUE=1,CALCULATION_METHOD=0,EXP_ID=-1)/Results?$select=UNIQUE_IDENTIFIER,TISSUE_ID,TISSUE_NAME,TISSUE_SAP_SYNONYM,SAMPLE_ID,SAMPLE_NAME,AFFINITY_PURIFICATION,EXPERIMENT_ID,EXPERIMENT_NAME,EXPERIMENT_SCOPE,EXPERIMENT_SCOPE_NAME,PROJECT_ID,PROJECT_NAME,PROJECT_STATUS,UNNORMALIZED_INTENSITY,NORMALIZED_INTENSITY,MIN_NORMALIZED_INTENSITY,MAX_NORMALIZED_INTENSITY,SAMPLES&$format=json", { responseType: "json" });
}
exports.getProteomicsData = getProteomicsData;
function getPrideData(acc) {
    let headers = new axios_1.AxiosHeaders();
    headers["Accept"] = "application/json";
    headers["Content-Type"] = "application/json";
    return axios_1.default.get("https://www.ebi.ac.uk/pride/ws/archive/v2/projects/" + acc, { responseType: "json", headers: headers });
}
exports.getPrideData = getPrideData;
function getEBIAlpha(id) {
    return axios_1.default.get("https://alphafold.ebi.ac.uk/" + "/api/prediction/" + id, { responseType: "json" });
}
exports.getEBIAlpha = getEBIAlpha;
function getStringDBInteractions(genes, organism, score = 400, networkType = "functional") {
    let params = new URLSearchParams();
    params.append("identifiers", genes.join("%0d"));
    params.append("required_score", score.toString());
    params.append("species", organism);
    params.append("network_type", networkType);
    return axios_1.default.get("https://string-db.org/api/tsv/network?", { responseType: "text", params: params });
}
exports.getStringDBInteractions = getStringDBInteractions;
function getInteractomeAtlas(genes, filterParameter = "None") {
    let params = new URLSearchParams();
    params.append("query_interactors", "query");
    params.append("query_id_array", genes.join("%2C"));
    params.append("search_term_parameter", genes.join("%2C"));
    params.append("filter_parameter", filterParameter);
    let searchTermArray = [];
    for (const g of genes) {
        searchTermArray.push("search_term_array%5B%5D=" + g);
    }
    return axios_1.default.get("https://www.interactome-atlas.org/search_results_interactions?" + params.toString() + "&" + searchTermArray.join("&"), { responseType: "json" }).then((res) => {
        return JSON.parse(res.data);
    });
}
exports.getInteractomeAtlas = getInteractomeAtlas;
