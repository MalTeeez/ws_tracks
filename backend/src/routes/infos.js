import {
    quickCloseResponse,
} from '../lib/utils/uws_util.js';

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

        const track = 
        if () {
            try {
                await checkAuth(req, res);
            } catch (err) {
                quickCloseResponse(res, "401", err.message);
                return;
            }
        }

        // Return video from db with uid
        res
            .writeStatus("200")
            .writeHeader(
                "message",
                'Successfully found video with id "' + video.uid + '".'
            )
            .writeHeader('content-type', 'application/json')
            .writeHeader("Access-Control-Allow-Origin", "*")
            .writeHeader("Access-Control-Allow-Headers", "*")
            .writeHeader("Access-Control-Expose-Headers", "*")
            .end(JSON.stringify(video));
    },
}