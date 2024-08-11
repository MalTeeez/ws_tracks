// @ts-check
import { InstantVector, PrometheusDriver } from "prometheus-query";
import Plane, { translate_property } from "../../../common/model/Plane.js";

const prom = new PrometheusDriver({
  endpoint: "http://localhost:9092",
  baseURL: "/api/v1", // default value
});

export async function queryInstant() {
    const q = "point_list";
    try {
        //console.time('http_req')
        const res = await prom.instantQuery(q);
        //console.timeEnd('http_req')
        return labels_to_planes(res.result);
    } catch (error) {
        return console.error(error);
    }
}

/**
 * 
 * @param {Array<InstantVector>} series 
 * @returns {Map<string, Plane>}
 */
function labels_to_fields(series) {
    /**
     * @type {Map<string, Object>}
     */
    const map = new Map()
    for (const entry of series) {
        // @ts-ignore
        const id = entry.metric.labels.id;
        // @ts-ignore
        const type = entry.metric.labels.type;
        const value = entry.value.value;
        if (!map.has(id)) {
            let obj = {}
            obj[type] = value;
            map.set(id, obj)
        } else {
            map.get(id)[type] = value;
        }
    }
    return map;
}

/**
 * 
 * @param {Array<InstantVector>} series 
 * @returns {Map<string, Plane>}
 */
function labels_to_planes(series) {
    /**
     * @type {Map<string, Plane>}
     */
    const map = new Map()
    for (const entry of series) {
        // @ts-ignore
        const id = entry.metric.labels.id;
        // @ts-ignore
        const type = translate_property(entry.metric.labels.type);
        const value = entry.value.value;
        if (!map.has(id)) {
            let plane = new Plane(id)
            if (type) {
                plane[type] = value;
                map.set(id, plane)
            }
        } else {
            // @ts-ignore We already checked if our map has this
            map.get(id)[type] = value;
        }
    }
    return map;
}