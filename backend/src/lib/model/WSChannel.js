//@ts-check
import Plane from "../../../../common/model/Plane.js";
import { app, planes } from "../../ws_track.js";
import { plane_to_message } from "../track_util.js";

/**
 * @class
 */
export class WebSocketChannel {
  /**
   * @type {number}
   */
  update_interval;
  /**
   * @type {string}
   */
  ws_channel_id;
  /**
   * @type {Set<number>}
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
   *
   * @param {number} update_interval
   */
  constructor(update_interval) {
    this.update_interval = update_interval;
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
    this.updating = false;
  }

  tick() {
    let subs = app.numSubscribers(this.ws_channel_id);
    //console.log("Channel " + this.ws_channel_id + " started tick to " + subs + " subs") 
    // Only compute and send if we actually have listeners
    if (subs > 0) {
      // Construct ws message
      let message = "";
      for (const id of this.track_updates) {
        let plane = planes.get(id);
        if (plane) {
          message += plane_to_message(plane);
        }
      }
      //console.log("Sending out " + this.track_updates.size + " tracks on channel " + this.ws_channel_id)
      // And send it out to listeners (only if it has entries)
      if (this.track_updates.size > 0) {
        app.publish(this.ws_channel_id, message);
      }
    }
    // Clear the updates afterwards, so we dont have them stacking up for nothing
    if (!this.updating) {
      this.track_updates = new Set();
    }
  }

  /**
   * Append a set of id of updated planes to the stored one for this channel
   * @param {Array<number>} uni_track_updates array of id of planes
   */
  append_track_updates(uni_track_updates) {
    this.updating = true;
    uni_track_updates.forEach((id) => {
      this.track_updates.add(id)
    });
    this.updating = false;
  }
}
