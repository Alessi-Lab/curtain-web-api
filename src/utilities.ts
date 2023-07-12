import axios, {AxiosHeaders} from "axios";

export function getProteomicsData(acc: string, tissueType: string) {
    let headers = new AxiosHeaders();
    headers["Accept"] = "application/json";
    headers["Content-Type"] = "application/json";
    return axios.get(
        "https://www.proteomicsdb.org/proteomicsdb/logic/api/proteinexpression.xsodata/InputParams(PROTEINFILTER='" +acc+"',MS_LEVEL=1,TISSUE_ID_SELECTION='',TISSUE_CATEGORY_SELECTION='"+tissueType+"',SCOPE_SELECTION=1,GROUP_BY_TISSUE=1,CALCULATION_METHOD=0,EXP_ID=-1)/Results?$select=UNIQUE_IDENTIFIER,TISSUE_ID,TISSUE_NAME,TISSUE_SAP_SYNONYM,SAMPLE_ID,SAMPLE_NAME,AFFINITY_PURIFICATION,EXPERIMENT_ID,EXPERIMENT_NAME,EXPERIMENT_SCOPE,EXPERIMENT_SCOPE_NAME,PROJECT_ID,PROJECT_NAME,PROJECT_STATUS,UNNORMALIZED_INTENSITY,NORMALIZED_INTENSITY,MIN_NORMALIZED_INTENSITY,MAX_NORMALIZED_INTENSITY,SAMPLES&$format=json",
        {responseType: "json"}
    )
}

export function getPrideData(acc: string) {
    let headers = new AxiosHeaders();
    headers["Accept"] = "application/json";
    headers["Content-Type"] = "application/json";
    return axios.get(
        "https://www.ebi.ac.uk/pride/ws/archive/v2/projects/" + acc,
        {responseType: "json", headers: headers}
    )
}

export function getEBIAlpha(id: string) {
    return axios.get(
        "https://alphafold.ebi.ac.uk/" +"/api/prediction/"+id,
        {responseType: "json"}
    )
}

export function getStringDBInteractions(genes: string[], organism: string, score: number = 400, networkType: string = "functional") {
    let params = new URLSearchParams();
    params.append("identifiers", genes.join("%0d"));
    params.append("required_score", score.toString());
    params.append("species", organism);
    params.append("network_type", networkType);
    return axios.get(
        "https://string-db.org/api/tsv/network?",
        {responseType: "text", params: params}
    )
}

export function getInteractomeAtlas(genes: string[], filterParameter: string ="None") {
    let params = new URLSearchParams();
    params.append("query_interactors", "query");
    params.append("query_id_array", genes.join("%2C"));
    params.append("search_term_parameter", genes.join("%2C"));
    params.append("filter_parameter", filterParameter);

    let searchTermArray: string[] = []
    for (const g of genes) {
        searchTermArray.push("search_term_array%5B%5D="+g)
    }

    return axios.get(
        "https://www.interactome-atlas.org/search_results_interactions?" + params.toString() + "&" + searchTermArray.join("&"),
        {responseType: "json"}
    ).then((res:any) => {
        return JSON.parse(<string>res.data)
    })
}
