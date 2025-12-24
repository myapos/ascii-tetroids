class PriorityQueue<T> {
  private _heap: T[];
  private _comparator: (a: T, b: T) => number | boolean;

  constructor(comparator: (a: T, b: T) => number | boolean = (a, b) => a > b) {
    this._heap = [];
    this._comparator = comparator;
  }

  size(): number {
    return this._heap.length;
  }

  peek(): T | undefined {
    return this._heap[0];
  }

  isEmpty(): boolean {
    return this._heap.length === 0;
  }

  private _parent(idx: number): number {
    return Math.floor((idx - 1) / 2);
  }

  private _leftChild(idx: number): number {
    return idx * 2 + 1;
  }

  private _rightChild(idx: number): number {
    return idx * 2 + 2;
  }

  private _swap(i: number, j: number): void {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }

  private _compare(i: number, j: number): number {
    const result = this._comparator(this._heap[i], this._heap[j]);
    return typeof result === "boolean" ? (result ? -1 : 1) : result;
  }

  enqueue(value: T): number {
    this._heap.push(value);
    this._siftUp();
    return this.size();
  }

  private _siftUp(): void {
    let nodeIdx = this.size() - 1;

    while (0 < nodeIdx && this._compare(nodeIdx, this._parent(nodeIdx)) < 0) {
      this._swap(nodeIdx, this._parent(nodeIdx));
      nodeIdx = this._parent(nodeIdx);
    }
  }

  dequeue(): T | undefined {
    if (this.size() > 1) {
      this._swap(0, this.size() - 1);
    }

    const poppedValue = this._heap.pop();
    this._siftDown();
    return poppedValue;
  }

  private _siftDown(): void {
    let nodeIdx = 0;

    while (
      (this._leftChild(nodeIdx) < this.size() &&
        this._compare(this._leftChild(nodeIdx), nodeIdx) < 0) ||
      (this._rightChild(nodeIdx) < this.size() &&
        this._compare(this._rightChild(nodeIdx), nodeIdx) < 0)
    ) {
      const smallerChildIdx =
        this._rightChild(nodeIdx) < this.size() &&
        this._compare(this._rightChild(nodeIdx), this._leftChild(nodeIdx)) < 0
          ? this._rightChild(nodeIdx)
          : this._leftChild(nodeIdx);

      this._swap(smallerChildIdx, nodeIdx);
      nodeIdx = smallerChildIdx;
    }
  }
}

export default PriorityQueue;
