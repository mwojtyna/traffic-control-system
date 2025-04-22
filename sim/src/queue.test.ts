import { describe, it, expect, beforeEach } from "vitest";
import { Queue } from "./queue.js";

describe("Queue", () => {
    let queue: Queue<number>;

    beforeEach(() => {
        queue = new Queue<number>();
    });

    it("should start with count 0", () => {
        expect(queue.getCount()).toBe(0);
    });

    it("should enqueue items and update count", () => {
        queue.enqueue(1);
        queue.enqueue(2);
        expect(queue.getCount()).toBe(2);
    });

    it("should return the correct item on peek", () => {
        queue.enqueue(42);
        expect(queue.peek()).toBe(42);
    });

    it("should dequeue items in FIFO order", () => {
        queue.enqueue(1);
        queue.enqueue(2);
        expect(queue.dequeue()).toBe(1);
        expect(queue.dequeue()).toBe(2);
        expect(queue.dequeue()).toBeNull();
    });

    it("should correctly update count on dequeue", () => {
        queue.enqueue(1);
        queue.enqueue(2);
        queue.dequeue();
        expect(queue.getCount()).toBe(1);
    });

    it("should return null from peek if queue is empty", () => {
        expect(queue.peek()).toBeNull();
    });

    it("should return all items from getAll in order", () => {
        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);
        expect(queue.getAll()).toEqual([1, 2, 3]);
    });

    it("should handle dequeue until empty and reset state", () => {
        queue.enqueue(1);
        queue.dequeue(); // Now queue is empty
        expect(queue.getCount()).toBe(0);
        expect(queue.peek()).toBeNull();
        expect(queue.dequeue()).toBeNull();

        queue.enqueue(10); // Ensure queue still works
        expect(queue.peek()).toBe(10);
    });
});
