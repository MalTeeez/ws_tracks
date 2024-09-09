import { querySingleHistory } from '../lib/utils/prom_util.js';
import {
    checkClientOrigin,
    quickCloseResponse,
} from '../lib/utils/uws_util.js';
import { TRACK_SERVER } from '../ws_track.js';

export default {
    info: async function info(res, req) {
        /**
         * @type {string}
         */
        let track_id = req.getQuery("id");
        const origin = req.getHeader("origin")

        if (!checkClientOrigin(origin)) {
            res
                .writeStatus("400")
                .writeHeader("Access-Control-Allow-Origin", "https://sxmaa.net")
                .end()
            return;
        }

        if (!track_id) { // Disabled as long as I still have faulty ids || track_id.length != 7) {
            quickCloseResponse(
                res,
                "400",
                "Track Id not provided or in wrong format."
            );
            return;
        }

        let [track, update_ts] = TRACK_SERVER.getTrackedPlane(track_id)

        if (track && update_ts) {
            // Append the last update property to the track object we send out
            let api_track = { last_update: update_ts }
            Object.assign(api_track, track);
            res
                .writeStatus("200")
                .writeHeader(
                    "message",
                    'Successfully found track with id "' + track_id + '".'
                )
                .writeHeader('Content-Type', 'application/json')
                .writeHeader("Access-Control-Allow-Origin", origin)
                .end(JSON.stringify(api_track));
        } else {
            quickCloseResponse(res, "404", "Plane or Track not found.");
            return;
        }

    },
    info_options(res, req) {
        const origin = req.getHeader("origin")
        if (checkClientOrigin(origin)) {
            res
                .writeStatus("200")
                .writeHeader("Access-Control-Allow-Origin", origin)
                .writeHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
                .writeHeader("Access-Control-Allow-Headers", "*")
                .end()
            return;
        } else {
            res
                .writeStatus("400")
                .writeHeader("Access-Control-Allow-Origin", "https://sxmaa.net")
                .end()
            return;
        }

    },
    async history(res, req) {
        /**
         * @type {string}
         */
        let track_id = req.getQuery("id");
        const origin = req.getHeader("origin")

        if (!checkClientOrigin(origin)) {
            res
                .writeStatus("400")
                .writeHeader("Access-Control-Allow-Origin", "https://sxmaa.net")
                .end()
            return;
        }

        if (!track_id) { // Disabled as long as I still have faulty ids || track_id.length != 7) {
            quickCloseResponse(
                res,
                "400",
                "Track Id not provided or in wrong format."
            );
            return;
        }

        const data =  await querySingleHistory(track_id)

        //console.log("Got data: ", data)

        if (data) {
            // Append the last update property to the track object we send out
            res
                .writeStatus("200")
                .writeHeader(
                    "message",
                    'Successfully found track with id "' + track_id + '".'
                )
                .writeHeader('Content-Type', 'application/json')
                .writeHeader("Access-Control-Allow-Origin", origin)
                .end(JSON.stringify(Array.from(data.entries())));
        } else {
            quickCloseResponse(res, "500", "ERR");
            return;
        }
    }
}