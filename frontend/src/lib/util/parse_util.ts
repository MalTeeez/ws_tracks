import Plane from '../../../../common/model/Plane.js';

export function parseTrackString(track_msg: string): Array<Plane> {
    const tracks: Array<Plane> = new Array<Plane>;
    const matches: IterableIterator<RegExpExecArray> = track_msg.matchAll(/((?<plane_id>[0-9A-Z]{1,6}),(?<x_pos>\d+\.?\d{0,5}),(?<y_pos>\d+\.?\d{0,5});)+?/g);

    for (const group of matches) {
        const track_id: string | undefined = group.at(2);
        const x: string | undefined = group.at(3);
        const y: string | undefined = group.at(4);
        

        if ( track_id && x && y ) {
            //console.log("id: " + track_id + ", x: " + x + ", y: " + y + " - from: " + track_msg);
            const plane = new Plane(track_id, Number(x) * 100, Number(y) * 10)
            tracks.push(plane)
            console.log(plane)
        }
    }

    return tracks;
}