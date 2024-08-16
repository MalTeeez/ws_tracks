import Plane from "../../common/model/Plane.js";
import { WebSocketChannel } from "./WSChannel.js";
import { Interval } from "../../common/lib/time_util.js";
import { tracks_to_buffer, update_tracks_prometheus } from "./lib/utils/track_util.js";

/**
 * @class
 */
export class WebSocketTrackServer {
  TICK_RATE = 250;
  UPDATE_PER_TICK = 100;
  MAX_X = 1600;
  MAX_Y = 900;
  MAX_PLANES = 250;

  /**
   * @type {Map<string, Plane>}
   */
  planes;

  /**
   * @type {Array<WebSocketChannel>}
   */
  ws_track_channels = [];

  /**
   * @type {boolean}
   */
  active;

  /**
   * Create a new instance of a web socket track server
   * @param {number} tick_rate The amount of milliseconds to wait between every update
   * @returns {WebSocketTrackServer}
   */
  constructor(tick_rate) {
    this.TICK_RATE = tick_rate;
    this.active = false;
    this.planes = new Map();
    return this;
  }

  /**
   * Enable this track server, update every TICK_RATE ms 
   * Can be disabled again with .disable()
   */
  async enable() {
    //generateInitial();
    // Build the ws channels
    for (const interval of Interval) {
      ws_track_channels.push(new WebSocketChannel(interval, this.planes));
    }
    //ws_track_channels.push(new WebSocketChannel(500))
    // Enable the ws channels
    for (const channel of ws_track_channels) {
      channel.enable();
    }
    this.active = true;
    while (this.active) {
      await /** @type {Promise<void>} */ (
        new Promise(async (resolve) => {
          // TODO: Add track deletion messages to clients (see update_tracks_prometheus ending)

          // Get new changes
          let uni_track_updates = await update_tracks_prometheus(planes);

          // Append new track updates to all channels
          for (const channel of ws_track_channels) {
            //if (channel.update_interval == 500) console.log("Pushing " + uni_track_updates.length + " tracks to 500")
            channel.append_track_updates(uni_track_updates);
          }

          setTimeout(() => {
            resolve();
          }, TICK_RATE);
        })
      );
    }
  }

  /**
   * Disable the currently running track server
   */
  disable() {
    this.active = false;
  }

  /**
   *
   * @param {string} channel Name of targeted ws channel
   * @returns {false | string}
   */
  channelExists(channel) {
    // Remove leading /
    channel = channel.replace(/^\//m, "");
    for (const ws_channel of ws_track_channels) {
      //console.log("Comparing channel " + ws_channel.ws_channel_id + " to requested " + channel)
      if (ws_channel.ws_channel_id === channel) return channel;
    }
    return false;
  }

  /**
   * @returns {ArrayBuffer}
   */
  collectState() {
    return tracks_to_buffer(planes);
  }
}
