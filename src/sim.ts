import { type Road } from "./io.js";
import { log } from "./log.js";
import { Queue } from "./queue.js";

export interface Vehicle {
    id: string;
    endRoad: Road;
}

export type Light = "red" | "yellow" | "red-yellow" | "green";
export type LightState = { ns: Light; ew: Light };

export type State = {
    name: string;
    output: LightState;
    nextStateIndex: {
        // TODO: Multiple lanes (<-, ^->)
        // TODO: Green arrow
        p1: number; //       Change to EW green
        p2: number; //       Change to NS green
        p3: number; //       Change to red
        p4: number; //       Stay in the same state
    };
};

const states: State[] = [
    {
        name: "S0",
        output: { ns: "green", ew: "red" },
        nextStateIndex: { p1: 1, p2: 0, p3: 1, p4: 0 },
    },
    {
        name: "S1",
        output: { ns: "red", ew: "green" },
        nextStateIndex: { p1: 1, p2: 0, p3: 0, p4: 1 },
    },
];

export class Sim {
    private state: State;
    private timer: number; // Steps elapsed from the most recent light change
    private north: Queue<Vehicle>;
    private south: Queue<Vehicle>;
    private east: Queue<Vehicle>;
    private west: Queue<Vehicle>;
    private pedestrianRequests: Queue<Road>;

    // Preferences
    private ratio: number;
    private greenMin: number;
    private greenMax: number;

    /**
     * @param ratio Change red to green when cars_stopped/cars_going >= ratio
     * @param greenMin Minimum number of steps before green ends
     * @param greenMax Maximum number of steps before green ends
     */
    constructor(ratio: number, greenMin: number, greenMax: number) {
        this.state = states[0];
        this.timer = 0;
        this.north = new Queue();
        this.south = new Queue();
        this.east = new Queue();
        this.west = new Queue();
        this.pedestrianRequests = new Queue();
        this.ratio = ratio;
        this.greenMin = greenMin;
        this.greenMax = greenMax;
    }

    addVehicle(v: Vehicle, startRoad: Road): void {
        switch (startRoad) {
            case "north":
                this.north.enqueue(v);
                break;
            case "south":
                this.south.enqueue(v);
                break;
            case "east":
                this.east.enqueue(v);
                break;
            case "west":
                this.west.enqueue(v);
                break;
        }
    }

    setPedestrianRequest(road: Road): void {
        this.pedestrianRequests.enqueue(road);
    }

    /**
     * @returns Vehicles that left the intersection during this step
     */
    step(): Vehicle[] {
        log("STEP:");
        log("state", this.state);
        log("timer", this.timer);
        log("pedestrianRequests", this.pedestrianRequests.getCount(), "\n");

        const leftVehicles: Vehicle[] = [];

        if (this.state.output.ns == "green" || this.state.output.ns == "yellow") {
            const vs = this.south.dequeue();
            const vn = this.north.dequeue();
            if (vs) {
                leftVehicles.push(vs);
            }
            if (vn) {
                leftVehicles.push(vn);
            }
        } else if (this.state.output.ew == "green" || this.state.output.ew == "yellow") {
            const ve = this.east.dequeue();
            const vw = this.west.dequeue();
            if (ve) {
                leftVehicles.push(ve);
            }
            if (vw) {
                leftVehicles.push(vw);
            }
        }

        const carsNS = this.north.getCount() + this.south.getCount();
        const carsEW = this.east.getCount() + this.west.getCount();
        const pedRequest = this.pedestrianRequests.peek();

        const prevStateName = this.state.name;
        let stateIndex = -1;

        if (this.timer >= this.greenMin && (carsNS == 0 || carsEW / carsNS >= this.ratio)) {
            // min time elapsed and too many cars waiting on EW, changing EW to green
            stateIndex = this.state.nextStateIndex.p1;
        } else if (
            this.timer >= this.greenMin &&
            (pedRequest == "north" || pedRequest == "south")
        ) {
            // min time elapsed and crossing request on NS, changing EW to green
            this.pedestrianRequests.dequeue();
            stateIndex = this.state.nextStateIndex.p1;
        } else if (this.timer >= this.greenMin && (carsEW == 0 || carsNS / carsEW >= this.ratio)) {
            // min time elapsed and too many cars waiting on NS, changing NS to green
            this.pedestrianRequests.dequeue();
            stateIndex = this.state.nextStateIndex.p2;
        } else if (this.timer >= this.greenMin && (pedRequest == "east" || pedRequest == "west")) {
            // min time elapsed and crossing request on EW, changing NS to green
            this.pedestrianRequests.dequeue();
            stateIndex = this.state.nextStateIndex.p2;
        } else if (this.timer >= this.greenMax) {
            // max green time elapsed, changing to red
            stateIndex = this.state.nextStateIndex.p3;
        } else {
            // when no predicates match
            stateIndex = this.state.nextStateIndex.p4;
        }

        this.state = states[stateIndex];
        if (prevStateName == this.state.name) {
            this.timer++;
        } else {
            this.timer = 0;
        }

        return leftVehicles;
    }
}
