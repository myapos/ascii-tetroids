/**
 * DSU (Disjoint Set Union) / Union-Find
 *
 * Maps each element to its cluster leader (root of the cluster)
 * clusterMap:
 *   - key: a node index (0..N-1)
 *   - value: the *current cluster* of that node
 *     - if clusterMap[x] === x, then x is a root of a set
 *
 * Notes: each cluster leader will represent a
 * group of overlapping ranges
 *
 * rank:
 *   - key: a root node
 *   - value: an approximate tree height used for union-by-rank optimization
 */
class DSU {
  clusterMap: Map<number, number> = new Map();
  rank: Map<number, number> = new Map();

  constructor(ranges: unknown[][]) {
    for (let i = 0; i < ranges.length; i++) {
      this.clusterMap.set(i, i);
      this.rank.set(i, 0);
    }
  }

  find(x: number): number {
    // Path compression:
    // Make every node on the path point directly to the root.
    // used for optimization
    if (this.clusterMap.get(x) !== x) {
      this.clusterMap.set(x, this.find(this.clusterMap.get(x)!));
    }
    return this.clusterMap.get(x)!;
  }

  union(a: number, b: number) {
    const rootA = this.find(a);
    const rootB = this.find(b);

    if (rootA === rootB) return;

    const rankA = this.rank.get(rootA)!;
    const rankB = this.rank.get(rootB)!;

    if (rankA < rankB) {
      this.clusterMap.set(rootA, rootB);
    }
    if (rankA > rankB) {
      this.clusterMap.set(rootB, rootA);
    }
    if (rankA === rankB) {
      this.clusterMap.set(rootA, rootB);
      this.rank.set(rootB, rankB + 1);
    }
  }

  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }
}

export default DSU;
