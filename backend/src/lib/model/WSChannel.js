//@ts-check
import Plane from "../../../../common/model/Plane.js";
import { APP } from "../../ws_track.js";
import { track_updates_to_buffer } from '../utils/track_util.js';

/**
 * @class
 */
export class WebSocketChannel {
  /**
   * @type {number}
   */
  update_interval;
  /**
  * @type {Map<string, Plane>}
  */
  plane_state_tracker;
  /**
   * @type {string}
   */
  ws_channel_id;
  /**
   * @type {Set<string>}
   */
  track_updates = new Set();
  /**
   * @type {boolean}
   */
  active;
  /**
   * @type {boolean}
   */
  updating;

  /**
   * @param {number} update_interval
   * @param {Map<string, Plane>} plane_state_tracker
   */
  constructor(update_interval, plane_state_tracker) {
    this.update_interval = update_interval;
    this.plane_state_tracker = plane_state_tracker;
    this.ws_channel_id = "tracks/" + update_interval;
    this.active = false;
    this.updating = false;
  }

  async enable() {
    this.active = true;
    while (this.active) {
      await /** @type {Promise<void>} */
      (
        new Promise((resolve) => {
          // Send data to subs
          this.tick();
          // And wait to do it again
          setTimeout(() => {
            resolve();
          }, this.update_interval);
        })
      );
    }
  }

  disable() {
    this.active = false;
  }

  tick() {
    let subs = APP.numSubscribers(this.ws_channel_id);
    //console.log("Channel " + this.ws_channel_id + " started tick to " + subs + " subs") 
    // Only compute and send if we actually have listeners
    if (subs > 0) {
      
      // Construct ws message
      /**
       * @type {ArrayBuffer}
       */
      const message = track_updates_to_buffer(this.track_updates, this.plane_state_tracker)
      //console.log("Sending out " + this.track_updates.size + " tracks on channel " + this.ws_channel_id)
      // And send it out to listeners (only if it has entries)
      if (this.track_updates.size > 0) {
        APP.publish(this.ws_channel_id, message, true, true);
      }
    }
    // Clear the updates afterwards, so we dont have them stacking up for nothing
    if (!this.updating) {
      this.track_updates = new Set();
    }
  }

  /**
   * Append a set of id of updated planes to the stored one for this channel
   * @param {Array<string>} uni_track_updates array of id of planes
   */
  append_track_updates(uni_track_updates) {
    this.updating = true;
    uni_track_updates.forEach((id) => {
      this.track_updates.add(id)
    });
    this.updating = false;
  }
}
