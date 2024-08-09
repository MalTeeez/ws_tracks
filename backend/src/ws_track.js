// @ts-check
import uws from '../dist/uws.js';
import Plane from '../../common/model/Plane.js'

const PORT = 9001;


const planes = new Map();
let track_updates = [];

generateInitial()


const app = uws.App().ws('/*', {
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
    open: (ws) => {
        console.log('A WebSocket connected with URL: ' + ws.data);
        ws.send("Hi new connection!")
        if ( ws.data === "/tracks/500" ) {
            if (!ws.subscribe('tracks')) {
                ws.end(500)
            }
        } else {
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
    while (true) {
        await /** @type {Promise<void>} */(new Promise((resolve) => {
            let subs = app.numSubscribers('tracks');
            if ( subs > 0 ) {
                //steps = steps >= 1000 ? 0 : steps + 1;
                // Construct ws message
                let message = "";
                let next_track_update = [];
                for (const id of track_updates) {
                    let plane = planes.get(id);
                    message += `${id},${plane.x},${plane.y};`;
                    if ((plane.x < 0 || plane.y < 0) || (plane.x > 1000 || plane.y > 1000)) {
                        planes.set(id, new Plane(randomInt(0,1000), randomInt(0,1000), id))
                        next_track_update.push(id);
                    }
                }
                app.publish('tracks', message);

                track_updates = next_track_update.slice();
                next_track_update = [];
                for (let i = 1; i <= 1000; i++) { 
                    let id = randomInt(1,1000)
                    let plane = planes.get(id)
                    if (plane) {
                        plane.x += randomInt(-5,5)
                        plane.y += randomInt(-5,5)
                        track_updates.push(id)
                    } else {
                        planes.set(id, new Plane(randomInt(0,1000), randomInt(0,1000), id))
                    }
                }

            }
            // @ts-ignore
            process.stdout.clearLine(0);
            // @ts-ignore
            process.stdout.cursorTo(0);
            // @ts-ignore
            process.stdout.write(
                "subs: " + subs
            );
            setTimeout(() => {
                resolve()
            }, 500);
        }));
    }
}


function generateInitial() {
    for (let i = 1; i <= 1000; i++) { 
        planes.set(i, new Plane(randomInt(0,1000), randomInt(0,1000), i))
        track_updates.push(i)
    }
    console.log("a")
}

/**
 * @param {number} min
 * @param {number} max
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

main();