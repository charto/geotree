export const enum QuadPos { SW = 0, SE, NW, NE }
export const enum QuadType { missing = 0, leaf, branch }

/** List of quadtree child nodes, indexed using QuadPos. */
export type QuadList = [
	QuadTile | null,
	QuadTile | null,
	QuadTile | null,
	QuadTile | null
];

export class QuadTile {
	constructor(
		public s: number,
		public w: number,
		public n: number,
		public e: number
	) {}

	split(spec: QuadType[] = []) {
		const s = this.s;
		const w = this.w;
		const n = this.n;
		const e = this.e;
		const ns = s + (n - s >> 1);
		const ew = w + (e - w >> 1);

		this.childList = [
			spec[QuadPos.SW] ? this.makeChild(s, w, ns, ew) : null,
			spec[QuadPos.SE] ? this.makeChild(s, ew, ns, e) : null,
			spec[QuadPos.NW] ? this.makeChild(ns, w, n, ew) : null,
			spec[QuadPos.NE] ? this.makeChild(ns, ew, n, e) : null
		];
	}

	protected makeChild(
		s: number,
		w: number,
		n: number,
		e: number
	) {
		return(new QuadTile(s, w, n, e));
	}

	childList: QuadList | null | undefined;
	featureCount = 0;
}

export class QuadTree {
	constructor(
		public s: number,
		public w: number,
		public n: number,
		public e: number
	) {
		this.root = new QuadTile(s, w, n, e);
	}

	importStructure(spec: QuadType[]) {
		let pos = 0;
		let node = this.root;

		function rec(node: QuadTile) {
			const part = spec.slice(pos, pos + 4);
			pos += 4;

			node.split(part);

			for(let sub: QuadType = 0; sub < 4; ++sub) {
				if(part[sub] == QuadType.branch) rec(node.childList![sub]!);
			}
		}

		rec(this.root);

		return(this);
	}

	exportStructure() {
		const spec: QuadType[] = [];

		function rec(childList: QuadList | null | undefined) {
			if(!childList) return;

			for(let child of childList) {
				spec.push(
					!child ? QuadType.missing : (
						child.childList ? QuadType.branch : QuadType.leaf
					)
				);
			}

			for(let child of childList) {
				if(child) rec(child.childList);
			}
		}

		rec(this.root.childList);

		return(spec);
	}

	root: QuadTile;
}
