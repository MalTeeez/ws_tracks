/**
* AUTHOR: Mika Hensel - 2024
*/

import { Interval } from '../../../../common/lib/time_util.js';
import uws from '../../../dist/uws.js'
import { TRACK_SERVER } from '../../ws_track.js';


/**
 * Reads the body from a HttpResponse into a raw buffer
 * @param {HttpReponse} res The uWS HttpResponse object
 * @returns A Promise with a buffer object as resolve
 * @description This function attaches a callback to the HttpResponse object,
 * and must therefore be called, but not awaited, before awaiting the HttpRequest object
 */
export async function readBody(res) {
  try {
    const result = await new Promise((resolve) => {
      let buffer;
      res.onData((chunk, isLast) => {
        const curBuf = Buffer.from(chunk);
        buffer = buffer
          ? Buffer.concat([buffer, curBuf])
          : isLast
          ? curBuf
          : Buffer.concat([curBuf]);
        if (isLast) {
          resolve(buffer);
        }
      });
      res.onAborted(() => {
        console.log("Failed to read body.");
      });
    });
    return result;
  } catch (err) {
    console.log("Failed to read body. err: " + err);
    quickCloseResponse(res, "400", "Failed to parse body.");
  }
}


/**
 * Reads the body from a HttpResponse into a JSON object
 * @param {HttpReponse} res The uWS HttpResponse object
 * @returns A Promise with a JSON object as resolve
 * @description This function attaches a callback to the HttpResponse object,
 * and must therefore be called, but not awaited, before awaiting the HttpRequest object
 */
export async function readJsonBody(res) {
  let body;
  try {
    const result = await new Promise((resolve) => {
      let buffer;
      res.onData((chunk, isLast) => {
        const curBuf = Buffer.from(chunk);
        buffer = buffer
          ? Buffer.concat([buffer, curBuf])
          : isLast
          ? curBuf
          : Buffer.concat([curBuf]);
        if (isLast) {
          resolve(buffer);
        }
      });
      res.onAborted(() => {
        console.log("Failed to read body.");
      });
    });
    body = result;
  } catch (err) {
    console.log("Failed to read body. err: " + err);
    quickCloseResponse(res, "400", "Failed to read body.");
  }
  try {
    return JSON.parse(body);
  } catch (err) {
    console.log("Failed to parse json. err: " + err);
    quickCloseResponse(res, "400", "Failed to parse JSON.");
  }
}


/**
 * Reads the body from a multipart HttpRequest into a Part Object
 * @param {HttpReponse} res An uWS HttpReponse object
 * @param {*} header A header type for content-type
 * @returns TODO
 */
export async function readMultipart(res, header) {
  let body;
  try {
    const result = await new Promise((resolve) => {
      let buffer;
      res.onData((chunk, isLast) => {
        const curBuf = Buffer.from(chunk);
        buffer = buffer
          ? Buffer.concat([buffer, curBuf])
          : isLast
          ? curBuf
          : Buffer.concat([curBuf]);
        if (isLast) {
          resolve(buffer);
        }
      });
      res.onAborted(() => {
        console.log("Failed to read body.");
      });
    });
    body = result;
  } catch (err) {
    console.log("Failed to read body. err: " + err);
    quickCloseResponse(res, "400", "Failed to read body.");
  }
  try {
    return uws.getParts(body, header);
  } catch (err) {
    console.log("Failed to parse multipart. err: " + err);
    quickCloseResponse(res, "400", "Failed to parse Multipart.");
  }
}


/**
 * Patch a http reponse to better handle false ends and aborts
 * @param {HttpReponse} res The uWS HttpResponse object
 */
function safetyPatchRes(res) {
  if (res._end) {
    throw new Error("already patched");
  }
  res.onAborted(() => {
    res.aborted = true;
    if (res.abortEvents) {
      res.abortEvents.forEach((f) => f());
    }
  });

  res.onAborted = (handler) => {
    res.abortEvents = res.abortEvents || [];
    res.abortEvents.push(handler);
    return res;
  };

  // Cache writes until `.end()` gets called. Then flush
  res.status = "";
  res.headers = [];

  const flush = (thunk) => {
    return res._cork(() => {
      if (res.status) res._writeStatus(res.status);
      res.headers.forEach((header) => {
        res._writeHeader(...header);
      });
      return thunk();
    });
  };

  res._end = res.end;
  res.end = (body) => {
    if (res.done) {
      console.log(`uWS: Called end after done`);
    }
    if (res.done || res.aborted) return res;
    res.done = true;
    return flush(() => res._end(body));
  };

  res._close = res.close;
  res.close = () => {
    if (res.done) {
      console.log(`uWS: Called close after done`);
    }
    if (res.done || res.aborted) return res;
    res.done = true;
    return res._close();
  };

  res._cork = res.cork;
  res.cork = () => {
    throw new Error(
      "safetyPatchRes applies the cork for you, do not call directly"
    );
  };

  res._tryEnd = res.tryEnd;
  res.tryEnd = (fullBodyOrChunk, totalSize) => {
    if (res.done) {
      console.log(`uWS: Called tryEnd after done`);
    }
    if (res.done || res.aborted) return [true, true];
    return flush(() => res._tryEnd(fullBodyOrChunk, totalSize));
  };

  res._write = res.write;
  res.write = (chunk) => {
    if (res.done) {
      console.log(`uWS: Called write after done`);
    }
    if (res.done || res.aborted) return res;
    return res._write(chunk);
  };

  res._writeHeader = res.writeHeader;
  res.writeHeader = (key, value) => {
    if (res.done) {
      console.log(`uWS: Called writeHeader after done`);
    }
    res.headers.push([key, value]);
    return res;
  };

  res._writeStatus = res.writeStatus;
  res.writeStatus = (status) => {
    if (res.done) {
      console.log(`uWS: Called writeStatus after done ${status}`);
    }
    res.status = status;
    return res;
  };

  res._upgrade = res.upgrade;
  res.upgrade = (...args) => {
    if (res.done) {
      console.log(`uWS: Called upgrade after done`);
    }
    if (res.done || res.aborted) return;
    return res._cork(() => {
      res._upgrade(...args);
    });
  };

  res._getProxiedRemoteAddressAsText = res.getProxiedRemoteAddressAsText;
  res.getProxiedRemoteAddressAsText = () => {
    if (res.done) {
      console.log(`uWS: Called getProxiedRemoteAddressAsText after done`);
    }
    if (res.done || res.aborted) return Buffer.from("");
    return res._getProxiedRemoteAddressAsText();
  };

  res._getRemoteAddressAsText = res.getRemoteAddressAsText;
  res.getRemoteAddressAsText = () => {
    if (res.done) {
      console.log(`uWS: Called getRemoteAddressAsText after done`);
    }
    if (res.done || res.aborted) return Buffer.from("");
    return res._getRemoteAddressAsText();
  };
}


/**
 * Encase an async HttpResponse handler in a "net" to prevent early ends, missing aborts and more.
 * @param {*} handler The async handler of type (HttpReponse, HttpRequest)
 * @returns The patched async handler
 */
export const uWSAsyncHandler = (handler) => async (res, req) => {
  safetyPatchRes(res);
  res.onAborted(() => console.log("uWS HttpResponse was aborted."));
  try {
    await handler(res, req);
    if (!res.done) {
      throw new Error("Async handler did not respond");
    }
  } catch (err) {
    res.writeStatus("503").end();
    console.log("uWS Async Handler failed while waiting. Error: " + err);
  }
};


/**
 * Quickly finish a HttpResponse object with status and header
 * @param {HttpResponse} res The uWS HttpResponse object
 * @param {string} status The HTTP status code
 * @param {string} message The Header response message, optional tuple
 */
export function quickCloseResponse(res, status, message) {
  res
    .writeStatus(status)
    .writeHeader("message", message)
    .writeHeader("Access-Control-Allow-Origin", "*")
    .writeHeader("Access-Control-Allow-Headers", "*")
    .writeHeader("Access-Control-Expose-Headers", "*")
    .end();
}

/**
 * Get a clients ip
 * @param {HttpRequest} req The uWS HttpRequest object
 * @returns A stringified ip
 */
export function getIP(req) {
  const ip = req.getHeader('x_forwarded_for');
  return ip ? ip : '127.0.0.1';
}


/**
 * Upgrade a http connection to a ws connection, and append the context (url) for the websocket
 * @param {HttpResponse} res The uWS HttpResponse object
 * @param {HttpRequest} req The uWS HttpRequest object
 * @param {*} context 
 */
export async function upgradeWsConnection(res, req, context) {
  console.log('A HTTP connection wants to a become WebSocket, URL: ' + req.getUrl() + '!');

  /* Keep track of abortions */
  const upgradeState = { aborted: false, upgrading: false };

  /* You MUST copy data out of req here, as req is only valid within this immediate callback */
  const url = req.getUrl();
  const secWebSocketKey = req.getHeader('sec-websocket-key');
  const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
  const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');

  res.onAborted(() => {
    upgradeState.aborted = true;
  });

  /* Do our async work */
  new Promise(async (resolve, reject) => {
    for (const interval of Interval) {
      if (url == "/tracks/" + interval) {
        resolve()
      }
    }
    reject("404", "WS channel " + url + " does not exist or can't be subscribed to.")
  }).then(() => {
    if (!upgradeState.aborted) {
      res.cork(() => {
        upgradeState.upgrading = true;
        /* This immediately calls open handler, we can not use res after this call */
        res.upgrade(
          { url: url },
          /* Use our copies here */
          secWebSocketKey,
          secWebSocketProtocol,
          secWebSocketExtensions,
          context
        );
      });
      return;
    } else {
      console.log("Client disconnected before we could upgrade it!");
      return;
    }
  }).catch((/** @type {string} */ message) => {
    if (!upgradeState.aborted) {
      console.log("WS upgrade failed with: ", message)
      if (!upgradeState.upgrading) {
        res.cork(() => {
          quickCloseResponse(res, "400", message)
        });
      }
    }
  })
}


/**
 * Connect a new websocket to a channel and subscribe to a topic
 * @param {WebSocket<UserData>} ws The uWS WebSocket Object
 */
export function openWsConnection(ws) {
  console.log("A WebSocket connected with URL: " + ws.url);
  ws.send("Hi new connection!");
  /**
   * @type {false | string}
   */
  let channel_state = TRACK_SERVER.channelExists(ws.url);
  if (channel_state != false) {
    if (!ws.subscribe(channel_state)) {
      // Something went wrong while subscribing this client to the new channel
      ws.end(500);
    } else {
      // Send inital state of all planes to this new client
      ws.send(TRACK_SERVER.collectState(), true, true);
    }
  } else {
    console.log("Consumer tried to subscribe to nonexistent channel " + ws.url);
    ws.end(404, "Channel not found.");
  }
}
