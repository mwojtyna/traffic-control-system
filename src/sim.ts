import { type Road } from "./io.js";
import { Queue, type Vehicle } from "./queue.js";

export type Light = "red" | "yellow" | "red-yellow" | "green";
export type LightState = { ns: Light; ew: Light };

export type State = {
    output: LightState;
    nextStateIndex: {
        p1: number; // timer >= greenMin && carsEW/carsNS >= ratio          (min time elapsed and too many cars waiting on EW, changing EW to green)
        p2: number; // timer >= greenMin && carsNS/carsEW >= ratio          (min time elapsed and too many cars waiting on NS, changing NS to green)
        p3: number; // timer >= greenMax                                    (max green time elapsed, changing to red)
        e: number; //                                                       (when no predicates match)

        // These transitions only changed states to themselves or to the next state (if all transitions changed to the next one), so the 'e' transition is equivalent to these.
        // p4: number; // timer < greenMin                                   (min green time not elapsed, staying on green)
        // p5: number; // timer >= greenMin && carsEW/carsNS < ratio         (min green time elapsed, but not changing NS to red because not enough cars waiting on EW)
        // p6: number; // timer >= greenMin && carsNS/carsEW < ratio         (min green time elapsed, but not changing EW to red because not enough cars waiting on NS)
    };
};

// const states: State[] = [
//     { output: { ns: "green", ew: "red" }, nextStateIndex: { p1: 1, p2: 0, p3: 1, e: 0 } }, // S0
//     { output: { ns: "yellow", ew: "red" }, nextStateIndex: { p1: 2, p2: 2, p3: 2, e: 2 } }, // S1
//     { output: { ns: "red", ew: "red" }, nextStateIndex: { p1: 3, p2: 3, p3: 3, e: 3 } }, // S2
//     { output: { ns: "red", ew: "red-yellow" }, nextStateIndex: { p1: 4, p2: 4, p3: 4, e: 4 } }, // S3
//     { output: { ns: "red", ew: "green" }, nextStateIndex: { p1: 4, p2: 5, p3: 5, e: 4 } }, // S4
//     { output: { ns: "red", ew: "yellow" }, nextStateIndex: { p1: 6, p2: 6, p3: 6, e: 6 } }, // S5
//     { output: { ns: "red", ew: "red" }, nextStateIndex: { p1: 7, p2: 7, p3: 7, e: 7 } }, // S6
//     { output: { ns: "red-yellow", ew: "red" }, nextStateIndex: { p1: 0, p2: 0, p3: 0, e: 0 } }, // S7
// ];

const states: State[] = [
    { output: { ns: "green", ew: "red" }, nextStateIndex: { p1: 1, p2: 0, p3: 1, e: 0 } }, // S0
    { output: { ns: "red", ew: "green" }, nextStateIndex: { p1: 1, p2: 0, p3: 0, e: 1 } }, // S1
];

export class Sim {
    private state: State;
    private timer: number; // Steps elapsed from the most recent light change
    private north: Queue;
    private south: Queue;
    private east: Queue;
    private west: Queue;

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
        this.ratio = ratio;
        this.greenMin = greenMin;
        this.greenMax = greenMax;
    }

    addVehicle(id: string, startRoad: Road, endRoad: Road): void {
        switch (startRoad) {
            case "north":
                this.north.enqueue(id, endRoad);
                break;
            case "south":
                this.south.enqueue(id, endRoad);
                break;
            case "east":
                this.east.enqueue(id, endRoad);
                break;
            case "west":
                this.west.enqueue(id, endRoad);
                break;
        }
    }

    step(): Vehicle[] {
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
        let stateIndex = -1;

        if (this.timer >= this.greenMin && (carsEW / carsNS >= this.ratio || carsNS == 0)) {
            stateIndex = this.state.nextStateIndex.p1;
        } else if (this.timer >= this.greenMin && (carsNS / carsEW >= this.ratio || carsEW == 0)) {
            stateIndex = this.state.nextStateIndex.p2;
        } else if (this.timer >= this.greenMax) {
            stateIndex = this.state.nextStateIndex.p3;
        } else {
            stateIndex = this.state.nextStateIndex.e;
        }

        this.state = states[stateIndex];
        this.timer++;

        return leftVehicles;
    }
}
