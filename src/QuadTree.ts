import { QuadTile, TileClass, QuadPos, QuadPosFlag, QuadList } from './QuadTile';

export class QuadTree<Tile extends QuadTile = QuadTile> {

	constructor(
		public s: number,
		public w: number,
		public n: number,
		public e: number,
		public Tile = QuadTile as TileClass<Tile>
	) {
		this.root = new Tile(s, w, n, e);
	}

	iterate(
		handler: (tile: Tile) => void,
		s = this.s,
		w = this.w,
		n = this.n,
		e = this.e,
		root = this.root
	) {
		function rec(node: Tile) {
			if(!node.childList) handler(node);
			if(!node.childList) return;

			const ns = s + (n - s) / 2;
			const ew = w + (e - w) / 2;
			let child: Tile | null;

			if(s < ns) {
				child = node.childList[QuadPos.SW];
				if(w < ew && child) rec(child);
				child = node.childList[QuadPos.SE];
				if(e >= ew && child) rec(child);
			}

			if(n >= ns) {
				child = node.childList[QuadPos.NW];
				if(w < ew && child) rec(child);
				child = node.childList[QuadPos.NE];
				if(e >= ew && child) rec(child);
			}
		}

		rec(root);
	}

	findTiles(s?: number, w?: number, n?: number, e?: number) {
		const result: Tile[] = [];

		this.iterate((tile: Tile) => tile.childList || result.push(tile), s, w, n, e);

		return(result);
	}

	/** Return up to 4 tiles of roughly similar size overlapping the query box,
	  * at least one overlapping by at least a quarter of the tile's size.
	  * Split tiles as needed. */

	splitBy(s: number, w: number, n: number, e: number) {
		const result: Tile[] = [];

		this.iterate((tile: Tile) => {
			// Calculate tile overlap with query box along both axes.
			const nsCoverage = Math.min(tile.n, n) - Math.max(tile.s, s);
			const ewCoverage = Math.min(tile.e, e) - Math.max(tile.w, w);

			if(nsCoverage > 0 && ewCoverage > 0) {
				const nsTile = tile.n - tile.s;
				const ewTile = tile.e - tile.w;

				if(
					// If the overlap is less than a quarter of the tile...
					nsCoverage * 2 < nsTile &&
					ewCoverage * 2 < ewTile &&
					// ...and the tile is more than a quarter of the query box...
					nsTile * 2 > n - s &&
					ewTile * 2 > e - w
				) {
					// ...then split the tile.
					tile.split();
				} else {
					result.push(tile);
				}
			}
		}, s, w, n, e);

		return(result);
	}

	importStructure(spec: number[]) {
		const Tile = this.Tile;
		let pos = 0;
		let node = this.root;

		function rec(node: Tile) {
			node.split(spec[pos++]);

			const branchPosFlags = spec[pos++];
			let posFlag = QuadPosFlag.SW;

			for(let pos = QuadPos.SW; pos < 4; ++pos) {
				if(branchPosFlags & posFlag) rec(node.childList![pos]!);
				posFlag <<= 1;
			}
		}

		rec(this.root);

		return(this);
	}

	exportStructure() {
		const spec: number[] = [];

		function rec(childList: QuadList<Tile> | undefined) {
			if(!childList) return;

			let childPosFlags = 0b0000;
			let branchPosFlags = 0b0000;
			let posFlag = QuadPosFlag.SW;

			for(let child of childList) {
				if(child) {
					childPosFlags |= posFlag;
					if(child.childList) branchPosFlags |= posFlag;
				}
				posFlag <<= 1;
			}

			spec.push(childPosFlags);
			spec.push(branchPosFlags);

			for(let child of childList) {
				if(child) rec(child.childList);
			}
		}

		rec(this.root.childList);

		return(spec);
	}

	root: Tile;

}
