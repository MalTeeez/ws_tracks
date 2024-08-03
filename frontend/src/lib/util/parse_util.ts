import { Plane } from "$lib/stores/trackStore";

export function parseTrackString(track_msg: string): Plane | undefined {
    const match = track_msg.match(/(\d+);(\d+);(\d+)/);
    const track_id: string | undefined = match?.at(1);
    const x: string | undefined = match?.at(2);
    const y: string | undefined = match?.at(3);

    if ( track_id && x && y ) {
        console.log("id: " + track_id + ", x: " + x + ", y: " + y + " - from: " + track_msg);
        const plane = new Plane(Number(x), Number(y))
        return plane;
    }
    return undefined;
}