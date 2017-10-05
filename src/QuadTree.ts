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
