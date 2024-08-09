import Plane from '../../../../common/model/Plane.js';

export function parseTrackString(track_msg: string): Array<Plane> {
    const tracks: Array<Plane> = new Array<Plane>;
    const matches: IterableIterator<RegExpExecArray> = track_msg.matchAll(/((\d+),(\d+),(\d+);)+?/g);

    for (const group of matches) {
        const track_id: string | undefined = group.at(2);
        const x: string | undefined = group.at(3);
        const y: string | undefined = group.at(4);
        

        if ( track_id && x && y ) {
            //console.log("id: " + track_id + ", x: " + x + ", y: " + y + " - from: " + track_msg);
            const plane = new Plane(Number(x), Number(y), Number(track_id))
            tracks.push(plane)
        }
    }

    return tracks;
}