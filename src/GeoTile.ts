import { Point, LineString } from 'geobabel';

import { QuadTile, QuadPos } from './QuadTile';

export interface LineStringRef {
	line: LineString;
	/** Index of starting point along the line string. */
	first: number;
	/** Index of end point along the line string. */
	last: number;
}

export class GeoTile extends QuadTile {

	addPoint(pt: Point) {
		this.pointList.push(pt);
		++this.pointCount;
	}

	addLine(line: LineString, first = 0, last = line.posList.length / 2) {
		this.lineList.push({ line, first, last });
		this.pointCount += last - first + 1;
	}

	split() {
		super.split();

		const swChild = this.childList![QuadPos.SW]!;
		const ns = swChild.n;
		const ew = swChild.e;

		for(let pt of this.pointList) {
		}
	}

	/** Total number of points and line string waypoints. */
	pointCount = 0;
	pointList: Point[] = [];
	lineList: LineStringRef[] = [];

}
