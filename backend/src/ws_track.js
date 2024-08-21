// @ts-check
import uws from "../dist/uws.js";
import { WebSocketTrackServer } from "./lib/model/WSTrackServer.js";
import { openWsConnection, upgradeWsConnection, uWSAsyncHandler } from "./lib/utils/uws_util.js";
import middleware_detail from './routes/infos.js';

const PORT = 9001;
const API_BASE_URL = "/api/";

export const APP = uws.App();
export const TRACK_SERVER = new WebSocketTrackServer(250);

APP.ws("/*", {
  /* Options */
  compression: uws.SHARED_COMPRESSOR,
  maxPayloadLength: 16 * 1024 * 1024,
  idleTimeout: 10,
  /* Handlers */
  upgrade: (res, req, context) => upgradeWsConnection(res, req, context),
  open: (ws) => openWsConnection(ws),
  message: (ws, message, isBinary) => {
    /* Ok is false if backpressure was built up, wait for drain */
    let ok = ws.send(message, isBinary);
  },
  drain: (ws) => {
    console.log("WebSocket backpressure: " + ws.getBufferedAmount());
  },
  close: (ws, code, message) => {
    console.log("WebSocket closed");
  },
});

// ENDPOINTS
/// INFO
APP.get(API_BASE_URL + "info",
  uWSAsyncHandler((res, req) => middleware_detail.info(res, req))
);
APP.options(API_BASE_URL + "info",
  uWSAsyncHandler((res, req) => middleware_detail.info_options(res, req))
)


// ROOT
APP.any("/*", (res, req) => {
  res
    .writeHeader("Access-Control-Allow-Origin", "*")
    .writeHeader("Access-Control-Allow-Headers", "*")
    .writeHeader("Access-Control-Expose-Headers", "*")
    .end("Nothing to see here!!");
});

APP.listen(PORT, (token) => {
  if (token) {
    console.log("Listening to PORT " + PORT);
  } else {
    console.log("Failed to listen to PORT " + PORT);
  }
});

// Start the track server
TRACK_SERVER.enable();