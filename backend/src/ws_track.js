// @ts-check
import uws from '../dist/uws.js';
import Plane from '../../common/model/Plane.js'
import { WebSocketChannel } from './lib/model/WSChannel.js';
import { randomInt } from './lib/util.js';
import { Interval } from '../../common/lib/time_util.js';

const PORT = 9001;
const TICK_RATE = 25;
const UPDATE_PER_TICK = 100;
const MAX_X = 1600;
const MAX_Y = 900;
const MAX_PLANES = 250;

/**
 * @type {Map<number, Plane>}
 */
export const planes = new Map();

/**
 * @type {Array<WebSocketChannel>}
 */
let ws_track_channels = [];



export const app = uws.App().ws('/*', {
    /* Options */
    compression: uws.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 10,
    /* Handlers */
    upgrade: (res, req, context) => {
        console.log('An Http connection wants to become WebSocket, URL: ' + req.getUrl() + '!');
        // TODO: Only upgrade if path exists
        res.upgrade({
            data: req.getUrl()
        },
            req.getHeader('sec-websocket-key'),
            req.getHeader('sec-websocket-protocol'),
            req.getHeader('sec-websocket-extensions'),
            context);

    },
    open: (/** @type {{ data: string; send: (arg0: string) => void; subscribe: (arg0: any) => any; end: (arg0: number) => void; "": any; }} */ ws) => {
        console.log('A WebSocket connected with URL: ' + ws.data);
        ws.send("Hi new connection!")
        /**
         * @type {false | string}
         */
        let channel_state = channelExists(ws.data);
        if ( channel_state != false ) {
            if (!ws.subscribe(channel_state)) {
                // Something went wrong while subscribing this client to the new channel
                ws.end(500)
            } else {
                // Send inital state of all planes to this new client
                ws.send(collectState())
            }
        } else {
            console.log("E404: consumer tried to subscribe to nonexistent channel " + ws.data)
            ws.send("404 Not Found")
            ws.end(404)
        }
    },
    message: (ws, message, isBinary) => {
        /* Ok is false if backpressure was built up, wait for drain */
        let ok = ws.send(message, isBinary);
    },
    drain: (ws) => {
        console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
        console.log('WebSocket closed');
    }
}).any('/*', (res, req) => {
    res.end('Nothing to see here!');
}).listen(PORT, (token) => {
    if (token) {
        console.log('Listening to port ' + PORT);
    } else {
        console.log('Failed to listen to port ' + PORT);
    }
});

async function main() {
    generateInitial();
    // Build the ws channels
    for (const interval of Interval) {
        ws_track_channels.push(new WebSocketChannel(interval))
    }
    //ws_track_channels.push(new WebSocketChannel(500))
    // Enable the ws channels
    for (const channel of ws_track_channels) {
        channel.enable();
    }

    while (true) {
        await /** @type {Promise<void>} */(new Promise((resolve) => {
                //steps = steps >= 1000 ? 0 : steps + 1;
                
                // TODO: Add some kind of OOB detection
                /*if (plane.x < 0 || plane.y < 0 || plane.x > 1000 || plane.y > 1000) {
                    planes.set(id, new Plane(randomInt(0, 1000), randomInt(0, 1000), id));
                }*/

                // Generate random changes
                let uni_track_updates = [];
                for (let i = 1; i <= UPDATE_PER_TICK; i++) { 
                    let id = randomInt(1,MAX_PLANES)
                    let plane = planes.get(id)
                    if (plane) {
                        plane.x += randomInt(-5,5)
                        plane.y += randomInt(-5,5)

                        uni_track_updates.push(id)
                    } else {
                        planes.set(id, new Plane(randomInt(0,MAX_X), randomInt(0,MAX_Y), id))
                    }
                }

                // Append new track updates to all channels
                for (const channel of ws_track_channels) {
                    //if (channel.update_interval == 500) console.log("Pushing " + uni_track_updates.length + " tracks to 500")
                    channel.append_track_updates(uni_track_updates);
                }


            setTimeout(() => {
                resolve()
            }, TICK_RATE);
        }));
    }
}


function generateInitial() {
    for (let i = 1; i <= MAX_PLANES; i++) { 
        planes.set(i, new Plane(randomInt(0,MAX_X), randomInt(0,MAX_Y), i))
    }
}

/**
 * 
 * @param {string} channel Name of targeted ws channel
 * @returns {false | string}
 */
function channelExists(channel) {
    // Remove leading /
    channel = channel.replace(/^\//m, "");
    for (const ws_channel of ws_track_channels) {
        //console.log("Comparing channel " + ws_channel.ws_channel_id + " to requested " + channel)
        if (ws_channel.ws_channel_id === channel) return channel;
    }
    return false;
}

/**
 * @returns {string}
 */
function collectState() {
    let message = "";
    for (const [, plane] of planes) {
        message += `${plane.id},${plane.x},${plane.y};`;
    }
    return message;
}

main();