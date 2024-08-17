import {
    quickCloseResponse,
} from '../lib/utils/uws_util.js';
import { TRACK_SERVER } from '../ws_track.js';

export default {
    info: async function info(res, req) {
        /**
         * @type {string}
         */
        let track_id = req.getQuery("id");

        if (!track_id || track_id.length != 7) {
            quickCloseResponse(
                res,
                "400",
                "Track Id not provided or in wrong format."
            );
            return;
        }

        const track = TRACK_SERVER.getTrackedPlane(track_id)
        if (track) {
            res
                .writeStatus("200")
                .writeHeader(
                    "message",
                    'Successfully found track with id "' + track_id + '".'
                )
                .writeHeader('content-type', 'application/json')
                .writeHeader("Access-Control-Allow-Origin", "*")
                .writeHeader("Access-Control-Allow-Headers", "*")
                .writeHeader("Access-Control-Expose-Headers", "*")
                .end(JSON.stringify(track));
        } else {
            quickCloseResponse(res, "404", "Plane or Track not found.");
            return;
        }

    },
}