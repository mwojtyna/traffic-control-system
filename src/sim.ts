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

type StateName = "S0" | "S1" | "S2" | "S3";
type State = {
    /** For checking if state changed, must be unique */
    name: StateName;
    prefs: {
        greenMin: number;
        greenMax: number;
        ratio: number;
    };
    output: {
        /** North/South */
        ns: LightState;
        /** East/West */
        ew: LightState;
    };
    nextStateIndex: number;
};

export class Sim {
    private state: State;
    private readonly states: State[];

    /** Steps elapsed including current from the most recent light change */
    private timer = 0;

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

    constructor(prefs: Preferences) {
        this.states = [
            {
                name: "S0",
                prefs: {
                    greenMin: prefs.ns.sr.greenMin,
                    greenMax: prefs.ns.sr.greenMax,
                    ratio: prefs.ns.ratio,
                },
                output: {
                    ns: { sr: "green", l: "red", cond: "red", ped: "red" },
                    ew: { sr: "red", l: "red", cond: "green", ped: "green" },
                },
                nextStateIndex: 1,
            },
            {
                name: "S1",
                prefs: {
                    greenMin: prefs.ns.l.greenMin,
                    greenMax: prefs.ns.l.greenMax,
                    ratio: prefs.ns.ratio,
                },
                output: {
                    ns: { sr: "red", l: "green", cond: "red", ped: "red" },
                    ew: { sr: "red", l: "red", cond: "red", ped: "red" },
                },
                nextStateIndex: 2,
            },
            {
                name: "S2",
                prefs: {
                    greenMin: prefs.ew.sr.greenMin,
                    greenMax: prefs.ew.sr.greenMax,
                    ratio: prefs.ew.ratio,
                },
                output: {
                    ns: { sr: "red", l: "red", cond: "green", ped: "green" },
                    ew: { sr: "green", l: "red", cond: "red", ped: "red" },
                },
                nextStateIndex: 3,
            },
            {
                name: "S3",
                prefs: {
                    greenMin: prefs.ew.l.greenMin,
                    greenMax: prefs.ew.l.greenMax,
                    ratio: prefs.ew.ratio,
                },
                output: {
                    ns: { sr: "red", l: "red", cond: "red", ped: "red" },
                    ew: { sr: "red", l: "green", cond: "red", ped: "red" },
                },
                nextStateIndex: 0,
            },
        ];
        this.state = this.states[0];
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

    /**
     * @returns Vehicles that left the intersection during this step
     */
    step(): Vehicle[] {
        log("STEP:");
        log("state", this.state);
        log("timer", this.timer);

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

        // State transitions
        let changedState = false;
        switch (this.state.name) {
            case "S0":
                if (this.shouldEndStateSR(carsEW_SR / (carsNS_SR + 1), carsNS_SR, carsNS_L)) {
                    changedState = true;
                }
                break;
            case "S1":
                if (this.shouldEndStateL(carsNS_L)) {
                    changedState = true;
                }
                break;
            case "S2":
                if (this.shouldEndStateSR(carsNS_SR / (carsEW_SR + 1), carsEW_SR, carsEW_L)) {
                    changedState = true;
                }
                break;
            case "S3":
                if (this.shouldEndStateL(carsEW_L)) {
                    changedState = true;
                }
                break;
        }

        if (changedState) {
            this.state = this.states[this.state.nextStateIndex];
            this.timer = 0;
        } else {
            this.timer++;
        }

        log("leftVehicles", leftVehicles, "\n");

        return leftVehicles;
    }

    /**
     * @param carRatio - End state when cars_stopped/cars_going >= ratio
     */
    private shouldEndStateSR(carRatio: number, carsSR: number, carsL: number): boolean {
        return (
            (this.timer >= this.state.prefs.greenMin &&
                (carRatio >= this.state.prefs.ratio || (carsSR == 0 && carsL > 0))) ||
            this.timer >= this.state.prefs.greenMax
        );
    }

    private shouldEndStateL(carsAmount: number): boolean {
        return (
            (this.timer >= this.state.prefs.greenMin && carsAmount == 0) ||
            this.timer >= this.state.prefs.greenMax
        );
    }
}
