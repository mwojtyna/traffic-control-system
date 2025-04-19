import { type Road } from "./io.js";
import { error, log } from "./log.js";
import { Queue } from "./queue.js";

type Vehicle = {
    id: string;
    endRoad: Road;
};

type LightPreferences = {
    /** Minimum number of steps before green ends */
    greenMin: number;
    /** Maximum number of steps before green ends */
    greenMax: number;
};
type DirectionPreferences = {
    /** Change red to green when this_dir_cars_stopped/opposite_dir_cars_going >= ratio */
    ratio: number;
    /** North/South Straight&Right */
    sr: LightPreferences;
    /** North/South Left */
    l: LightPreferences;
};
type Preferences = {
    ns: DirectionPreferences;
    ew: DirectionPreferences;
};

type Light = "red" | "green";
type LightState = {
    /** Straight & Right */
    sr: Light;
    /** Left */
    l: Light;
    /** Pedestrian */
    ped: Light;
    /** Conditional Right ("strzałka") */
    cond: Light;
};

type State = {
    /** For checking if state changed, must be unique */
    name: string;
    output: {
        /** North/South */
        ns: LightState;
        /** East/West */
        ew: LightState;
    };
    nextStateIndex: {
        /** Change faster to EW green */
        p1: number;
        /** Change faster to NS green */
        p2: number;
        /** Change to red (max steps elapsed) */
        p3: number;
        // /** Skip NS left arrow (0 cars waiting) */
        // p4: number;
        // /** Skip EW left arrow (0 cars waiting) */
        // p5: number;
        /** No change */
        e: number;
    };
};

const states: State[] = [
    {
        name: "S0",
        output: {
            ns: { sr: "green", l: "red", cond: "red", ped: "red" },
            ew: { sr: "red", l: "red", cond: "green", ped: "green" },
        },
        nextStateIndex: { p1: 1, p2: 0, p3: 1, e: 0 },
    },
    {
        name: "S1",
        output: {
            ns: { sr: "red", l: "green", cond: "red", ped: "red" },
            ew: { sr: "red", l: "red", cond: "red", ped: "red" },
        },
        nextStateIndex: { p1: 2, p2: 1, p3: 2, e: 1 },
    },
    {
        name: "S2",
        output: {
            ns: { sr: "red", l: "red", cond: "green", ped: "green" },
            ew: { sr: "green", l: "red", cond: "red", ped: "red" },
        },
        nextStateIndex: { p1: 2, p2: 3, p3: 3, e: 2 },
    },
    {
        name: "S3",
        output: {
            ns: { sr: "red", l: "red", cond: "red", ped: "red" },
            ew: { sr: "red", l: "green", cond: "red", ped: "red" },
        },
        nextStateIndex: { p1: 3, p2: 0, p3: 0, e: 3 },
    },
];

export class Sim {
    private state: State;
    /** Steps elapsed including current from the most recent light change */
    private timer = 1;

    // SR = Straight&Right
    // L = left
    private readonly northSR = new Queue<Vehicle>();
    private readonly northL = new Queue<Vehicle>();
    private readonly southSR = new Queue<Vehicle>();
    private readonly southL = new Queue<Vehicle>();
    private readonly eastSR = new Queue<Vehicle>();
    private readonly eastL = new Queue<Vehicle>();
    private readonly westSR = new Queue<Vehicle>();
    private readonly westL = new Queue<Vehicle>();
    private readonly pedestrianRequests: Queue<Road> = new Queue();
    private readonly preferences: Preferences;

    constructor(preferences: Preferences) {
        this.state = states[0];
        this.preferences = preferences;
    }

    addVehicle(v: Vehicle, startRoad: Road): void {
        if (v.endRoad == startRoad) {
            error(`Vehicle ${v.id} cannot end on the same road it started on`);
            return;
        }

        // Assign vehicle to the correct lane
        switch (startRoad) {
            case "north":
                if (v.endRoad == "south" || v.endRoad == "west") {
                    this.northSR.enqueue(v);
                } else {
                    this.northL.enqueue(v);
                }
                break;
            case "south":
                if (v.endRoad == "north" || v.endRoad == "east") {
                    this.southSR.enqueue(v);
                } else {
                    this.southL.enqueue(v);
                }
                break;
            case "east":
                if (v.endRoad == "west" || v.endRoad == "north") {
                    this.eastSR.enqueue(v);
                } else {
                    this.eastL.enqueue(v);
                }
                break;
            case "west":
                if (v.endRoad == "east" || v.endRoad == "south") {
                    this.westSR.enqueue(v);
                } else {
                    this.westL.enqueue(v);
                }
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

        // Dequeue vehicles NS
        if (this.state.output.ns.sr == "green") {
            const v1 = this.southSR.dequeue();
            const v2 = this.northSR.dequeue();
            if (v1) {
                leftVehicles.push(v1);
            }
            if (v2) {
                leftVehicles.push(v2);
            }
        }
        if (this.state.output.ns.l == "green") {
            const v1 = this.southL.dequeue();
            const v2 = this.northL.dequeue();
            if (v1) {
                leftVehicles.push(v1);
            }
            if (v2) {
                leftVehicles.push(v2);
            }
        }
        if (this.state.output.ns.cond == "green") {
            if (this.southSR.peek()?.endRoad == "east") {
                leftVehicles.push(this.southSR.dequeue()!);
            }
            if (this.northSR.peek()?.endRoad == "west") {
                leftVehicles.push(this.northSR.dequeue()!);
            }
        }
        if (this.state.output.ns.ped == "green") {
            // TODO: For visualization?
        }

        // Dequeue vehicles EW
        if (this.state.output.ew.sr == "green") {
            const v1 = this.eastSR.dequeue();
            const v2 = this.westSR.dequeue();
            if (v1) {
                leftVehicles.push(v1);
            }
            if (v2) {
                leftVehicles.push(v2);
            }
        }
        if (this.state.output.ew.l == "green") {
            const v1 = this.eastL.dequeue();
            const v2 = this.westL.dequeue();
            if (v1) {
                leftVehicles.push(v1);
            }
            if (v2) {
                leftVehicles.push(v2);
            }
        }
        if (this.state.output.ew.cond == "green") {
            if (this.eastSR.peek()?.endRoad == "north") {
                leftVehicles.push(this.eastSR.dequeue()!);
            }
            if (this.westSR.peek()?.endRoad == "south") {
                leftVehicles.push(this.westSR.dequeue()!);
            }
        }
        if (this.state.output.ew.ped == "green") {
            // TODO: For visualization?
        }

        const carsNS_SR = this.northSR.getCount() + this.southSR.getCount();
        const carsNS_L = this.northL.getCount() + this.southL.getCount();
        const carsEW_SR = this.eastSR.getCount() + this.westSR.getCount();
        const carsEW_L = this.eastL.getCount() + this.westL.getCount();
        const pedRequest = this.pedestrianRequests.peek();
        const prevStateName = this.state.name;

        // Change NS to red faster
        const tooManyWaitingOnEW =
            carsNS_SR == 0 ||
            carsEW_SR / carsNS_SR >= this.preferences.ew.ratio ||
            (carsNS_L > 0 && carsEW_L / carsNS_L >= this.preferences.ew.ratio);
        const isPedRequestNS = pedRequest == "north" || pedRequest == "south";

        // Change EW to read faster
        const tooManyWaitingOnNS =
            carsEW_SR == 0 ||
            carsNS_SR / carsEW_SR >= this.preferences.ns.ratio ||
            (carsEW_L > 0 && carsNS_L / carsEW_L >= this.preferences.ns.ratio);
        const isPedRequestEW = pedRequest == "east" || pedRequest == "west";

        // TODO: Move this to state, initialize states in constructor and pass preferences there
        let greenMax = -1;
        if (this.state.output.ns.sr == "green") {
            greenMax = this.preferences.ns.sr.greenMax;
        } else if (this.state.output.ns.l == "green") {
            greenMax = this.preferences.ns.l.greenMax;
        } else if (this.state.output.ew.sr == "green") {
            greenMax = this.preferences.ew.sr.greenMax;
        } else if (this.state.output.ew.l == "green") {
            greenMax = this.preferences.ew.l.greenMax;
        }

        let greenMin = -1;
        if (this.state.output.ns.sr == "green") {
            greenMin = this.preferences.ns.sr.greenMin;
        } else if (this.state.output.ns.l == "green") {
            greenMin = this.preferences.ns.l.greenMin;
        } else if (this.state.output.ew.sr == "green") {
            greenMin = this.preferences.ew.sr.greenMin;
        } else if (this.state.output.ew.l == "green") {
            greenMin = this.preferences.ew.l.greenMin;
        }

        // State transitions
        let stateIndex: number;
        if (this.timer >= greenMin && (tooManyWaitingOnEW || isPedRequestNS)) {
            // Too many cars waiting on EW or pedestrian request on NS
            if (isPedRequestNS) {
                this.pedestrianRequests.dequeue();
            }
            stateIndex = this.state.nextStateIndex.p1;
        } else if (this.timer >= greenMin && (tooManyWaitingOnNS || isPedRequestEW)) {
            // Too many cars waiting on NS or pedestrian request on EW
            if (isPedRequestEW) {
                this.pedestrianRequests.dequeue();
            }
            stateIndex = this.state.nextStateIndex.p2;
        } else if (this.timer >= greenMax) {
            // Max time elapsed
            stateIndex = this.state.nextStateIndex.p3;
        } else {
            // Don't change
            stateIndex = this.state.nextStateIndex.e;
        }

        this.state = states[stateIndex];
        if (prevStateName == this.state.name) {
            this.timer++;
        } else {
            this.timer = 1;
        }

        return leftVehicles;
    }
}
