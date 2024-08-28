import type {
	Map as LeafletMap,
    MapOptions,
	LeafletEvent,
	LatLng,
    LatLngBounds,
	LatLngExpression,
	Point,
	LatLngLiteral
} from 'leaflet';
import {
	GOOGLEMAPS_API_KEY,
	GOOGLEMAPS_SESSION_TOKEN_SATELLITE,
	GOOGLEMAPS_SESSION_TOKEN_STREET,
	MAPTILER_API_KEY,
	MAPTILES_API_KEY,
	RETINATILES_API_KEY,
} from '../../.config.json';
import { writable, type Writable } from 'svelte/store';
import { update_state } from '$lib/stores/stores';

let MAP: LeafletMap | undefined = undefined;
export let map_bounds: Writable<LatLngBounds>;

interface MapEntry {
	id: string;
	url: string;
	attribution: string;
    size: number;
    zoom_offset: number;
}

export function getMapSourceKeys() {
    return map_sources.keys();
}

const map_sources: Map<string, MapEntry> = new Map([
	[
		'GOOGLE_STREETS',
		{
			id: 'GOOGLE_STREETS',
			url: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${GOOGLEMAPS_SESSION_TOKEN_STREET}&key=${GOOGLEMAPS_API_KEY}&orientation=0`,
			attribution: 'Google',
            size: 256,
            zoom_offset: 0
		},
	],
	[
		'GOOGLE_SATELLITE',
		{
			id: 'GOOGLE_SATELLITE',
			url: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${GOOGLEMAPS_SESSION_TOKEN_SATELLITE}&key=${GOOGLEMAPS_API_KEY}`,
			attribution: 'Google',
            size: 256,
            zoom_offset: 0
		},
	],
	[
		'MAPTILER_TOPO',
		{
			id: 'MAPTILER_TOPO',
			url: `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
			attribution: 'MapTiler',
            size: 512,
            zoom_offset: -1
		},
	],
	[
		'MAPTILES',
		{
			id: 'MAPTILES',
			url: `https://maptiles.p.rapidapi.com/en/map/v1/{z}/{x}/{y}.png?rapidapi-key=${MAPTILES_API_KEY}`,
			attribution: 'Maptiles',
            size: 256,
            zoom_offset: 0
		},
	],
	[
		'RETINATILES',
		{
			id: 'RETINATILES',
			url: `https://retina-tiles.p.rapidapi.com/local/osm@2x/v1/{z}/{x}/{y}.png?rapidapi-key=${RETINATILES_API_KEY}`,
			attribution: 'Retinatiles',
            size: 256,
            zoom_offset: 0
		},
	],
]);

export async function update_map(
	map_source_string: string | undefined,
	is_mounted_tmp: boolean,
	map_div: HTMLDivElement,
) {
	if (is_mounted_tmp && map_source_string) {
		const map_source: MapEntry | undefined = map_sources.get(map_source_string);

		if (map_source) {
			const leaflet = await import('leaflet');

			const options: MapOptions = {
				center: leaflet.latLng(53, 9),
				zoom: 11,
				zoomSnap: 0.25,
				zoomDelta: 0.25,
				wheelPxPerZoomLevel: 120,
				zoomAnimation: true,
			};

			if (MAP) {
				options.center = MAP.getCenter();
				options.zoom = MAP.getZoom();
				MAP.remove();
			}
			MAP = leaflet.map(map_div, options);

			leaflet
				.tileLayer(map_source.url, {
					tileSize: map_source.size,
					zoomOffset: map_source.zoom_offset,
					minZoom: 1,
					maxZoom: 21,
					attribution: `\u0026copy; ${map_source.attribution} \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap\u003c/a\u003e`,
					updateWhenIdle: true,
				})
				.addTo(MAP);
            
            map_bounds = writable(MAP.getBounds())

            MAP.addEventListener('zoomstart', updateBounds)
			MAP.addEventListener('zoomend', updateBounds)

			MAP.addEventListener('drag', updateBounds)
		}
	}
}

function updateBounds() {
    if (MAP) {
        map_bounds.set(MAP.getBounds());
		update_state.update(() => {return false})
    }
}

export function projectCoords(coords: LatLngLiteral, width: number, height: number): {x: number, y: number} {
	let point = { x: 0, y: 0 }
	if (MAP) {
		const map_point = MAP.project([coords.lat, coords.lng])
		point.x = map_point.x;
		point.y = map_point.y;

		//console.log("Coords ", coords, " turned into ", map_point)
	}
	
	const bounds = MAP?.getBounds()
	if (bounds) {
					//							  minLon				maxLon			    minLon
		const x = ((coords.lng - bounds.getWest()) / (bounds.getEast() - bounds.getWest()) * width) 
					//				maxLat							maxLat				  minLon
		const y = ((bounds.getNorth() - coords.lat) / (bounds.getNorth() - bounds.getSouth()) * height)
		//console.log("Our point would have been x: " + x + " y: " + y)

		point.x = x;
		point.y = y;
	}

	return point;
}