// @ts-check
import { InstantVector, PrometheusDriver, RangeVector } from "prometheus-query";
import Plane, { translate_property } from "../../../../common/model/Plane.js";

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

export async function querySingleHistory(track_id) {
  const q = `point_list{id="${track_id}", type=~"lat|lon|hei|spd"}`;
  const start = new Date().getTime() - 24 * 60 * 60 * 1000; // now - 24h
  const end = new Date();
  const step = 10; // 1 point every 5 seconds
  try {
    //console.time('http_req')
    const res = await prom.rangeQuery(q, start, end, step);
    //console.timeEnd('http_req')
    return range_labels_to_fields(res.result, track_id);
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
  const map = new Map();
  for (const entry of series) {
    // @ts-ignore
    const id = entry.metric.labels.id;
    // @ts-ignore
    const type = entry.metric.labels.type;
    const value = entry.value.value;
    if (!map.has(id)) {
      let obj = {};
      obj[type] = value;
      map.set(id, obj);
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
  const map = new Map();
  for (const entry of series) {
    // @ts-ignore
    const id = entry.metric.labels.id;
    // @ts-ignore
    const type = translate_property(entry.metric.labels.type);
    const value = entry.value.value;
    if (!map.has(id)) {
      let plane = new Plane(id, 0, 0);
      if (type) {
        plane[type] = value;
        map.set(id, plane);
      }
    } else {
      // @ts-ignore We already checked if our map has this
      map.get(id)[type] = value;
    }
  }
  return map;
}

/**
 *
 * @param {Array<RangeVector>} series_range
 * @param {String} track_id
 * @returns {Map<String, Plane>}
 */
function range_labels_to_fields(series_range, track_id) {
  const map = new Map();
  for (const range_vector of series_range) {
    // @ts-ignore
    const type = translate_property(range_vector.metric.labels.type);

    for (const entry of range_vector.values) {
      const timestamp = entry.time.getTime();

      if (!map.has(timestamp)) {
        let plane = new Plane(track_id, 0, 0);
        if (type) {
          plane[type] = entry.value;
          map.set(timestamp, plane);
        }

      } else {
        // @ts-ignore We already checked if our map has this, so we can just change it by reference
        map.get(timestamp)[type] = entry.value;
      }
    }
  }
  return map;
}
