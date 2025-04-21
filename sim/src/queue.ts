type Node<T> = {
    data: T;
    next: Node<T> | null;
};

export class Queue<T> {
    private head: Node<T> | null;
    private tail: Node<T> | null;
    private count: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this.count = 0;
    }

    enqueue(t: T): void {
        const node: Node<T> = {
            data: t,
            next: null,
        };

        if (this.tail) {
            this.tail.next = node;
        } else {
            this.head = node;
        }
        this.tail = node;

        this.count++;
    }

    dequeue(): T | null {
        if (!this.head) {
            return null;
        }

        const node = this.head;
        this.head = node.next;

        if (!this.head) {
            this.tail = null;
        }
        this.count--;

        return node.data;
    }

    peek(): T | null {
        return this.head?.data ?? null;
    }

    getCount(): number {
        return this.count;
    }

    /** Only use for getting detailed state data for simulation playback */
    getAll(): T[] {
        const items: T[] = [];
        let current = this.head;

        while (current) {
            items.push(current.data);
            current = current.next;
        }

        return items;
    }
}
