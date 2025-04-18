import { Road } from "./io.js";

export type Vehicle = {
    id: string;
    destination: Road;
    next: Vehicle | null;
};

export class Queue {
    private head: Vehicle | null;
    private tail: Vehicle | null;
    private count: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this.count = 0;
    }

    enqueue(id: string, destination: Road): void {
        const v: Vehicle = {
            id: id,
            destination,
            next: null,
        };

        if (this.tail) {
            this.tail.next = v;
        } else {
            this.head = v;
        }
        this.tail = v;

        this.count++;
    }

    dequeue(): Vehicle | null {
        if (!this.head) {
            return null;
        }

        const v = this.head;
        this.head = v.next;

        if (!this.head) {
            this.tail = null;
        }
        this.count--;

        return v;
    }
}
