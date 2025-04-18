import { type Road } from "./io.js";
import { Queue } from "./queue.js";

export type Direction = "north-south" | "east-west";
export type LightState = "red" | "yellow" | "green";

export class Sim {
    currentDirection: Direction;
    lightState: LightState; // Light state on current_direction
    timer: number;
    north: Queue;
    south: Queue;
    east: Queue;
    west: Queue;

    private threshold: number; // Change red to green when cars_stopped/cars_going >= this number
    private greenMin: number;
    private greenMax: number;

    constructor(threshold: number, greenMin: number, greenMax: number) {
        this.currentDirection = "north-south";
        this.lightState = "green";
        this.timer = 0;
        this.north = new Queue();
        this.south = new Queue();
        this.east = new Queue();
        this.west = new Queue();
        this.threshold = threshold;
        this.greenMin = greenMin;
        this.greenMax = greenMax;
    }

    addVehicle(id: string, start: Road, destination: Road): void {
        switch (start) {
            case "north":
                this.north.enqueue(id, destination);
                break;
            case "south":
                this.south.enqueue(id, destination);
                break;
            case "east":
                this.east.enqueue(id, destination);
                break;
            case "west":
                this.west.enqueue(id, destination);
                break;
        }
    }
}
