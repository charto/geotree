import { QuadTree } from './QuadTree';
import { GeoTile } from './GeoTile';

export class GeoTree extends QuadTree<GeoTile> {

	constructor(
		public s: number,
		public w: number,
		public n: number,
		public e: number
	) {
		super(s, w, n, e, GeoTile);
	}

}
