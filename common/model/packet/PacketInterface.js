// @ts-check

/**
 * @interface
 */
export default class Packet {
    /**
     * The id of this packet, not bigger than 255.
     * @type {number}
     */
    static ID;

    /**
     * The size in bytes of all properties of this packet.
     * @type {number}
     */
    static SIZE;

    /**
     * Convert this packet from an object into bytes for transmitting.
     * @returns {ArrayBuffer}
     */
    serialize() {
        return new ArrayBuffer(Packet.SIZE)
    }

}