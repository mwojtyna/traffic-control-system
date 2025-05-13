import { Config, Direction, StateConfig, StateName, StateSnapshot } from "./io.js";
import { log } from "./log.js";
import { Metrics } from "./metrics.js";
import { Queue } from "./queue.js";
import { Strategy } from "./strategy.js";

export type Vehicle = {
    id: string;
    endRoad: Direction;
};

type Light = "red" | "green";
export type LightState = {
    /** Straight & Right */
    sr: Light;
    /** Left */
    l: Light;
    /** Pedestrian */
    ped: Light;
    /** Conditional Right ("strzałka") */
    cond: Light;
};

export type State = {
    /** For checking if state changed, must be unique */
    name: StateName;
    prefs: StateConfig;
    output: {
        /** North/South */
        ns: LightState;
        /** East/West */
        ew: LightState;
    };
    nextStateIndex: number;
};

export type Prefs = {
    /** Max number of cars when ped request switches cycle faster */
    pedRequestMaxCars: number;
};

export class Sim {
    private state: State;
    private readonly states: State[];
    private metrics: Metrics | null;

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
    private pedRequestN = false;
    private pedRequestS = false;
    private pedRequestE = false;
    private pedRequestW = false;

    private readonly prefs: Prefs;
    private readonly strategy: Strategy;

    constructor(config: Config, strategy: Strategy) {
        this.states = [
            {
                name: "NS_SR",
                prefs: config.states.NS_SR,
                output: {
                    ns: { sr: "green", l: "red", cond: "red", ped: "red" },
                    ew: { sr: "red", l: "red", cond: "green", ped: "green" },
                },
                nextStateIndex: 1,
            },
            {
                name: "NS_L",
                prefs: config.states.NS_L,
                output: {
                    ns: { sr: "red", l: "green", cond: "red", ped: "red" },
                    ew: { sr: "red", l: "red", cond: "red", ped: "red" },
                },
                nextStateIndex: 2,
            },
            {
                name: "EW_SR",
                prefs: config.states.EW_SR,
                output: {
                    ns: { sr: "red", l: "red", cond: "green", ped: "green" },
                    ew: { sr: "green", l: "red", cond: "red", ped: "red" },
                },
                nextStateIndex: 3,
            },
            {
                name: "EW_L",
                prefs: config.states.EW_L,
                output: {
                    ns: { sr: "red", l: "red", cond: "red", ped: "red" },
                    ew: { sr: "red", l: "green", cond: "red", ped: "red" },
                },
                nextStateIndex: 0,
            },
        ];
        this.state = this.states[0];
        this.prefs = { pedRequestMaxCars: config.pedRequestMaxCars };
        this.metrics = config.metrics ? new Metrics() : null;
        this.strategy = strategy;
    }

    addVehicle(v: Vehicle, startRoad: Direction): void {
        // Assign vehicle to the correct lane
        // Also simulates U-turns
        switch (startRoad) {
            case "north":
                if (v.endRoad == "south" || v.endRoad == "west") {
                    this.northSR.enqueue(v);
                } else if (v.endRoad == "north" || v.endRoad == "east") {
                    this.northL.enqueue(v);
                }
                break;
            case "south":
                if (v.endRoad == "north" || v.endRoad == "east") {
                    this.southSR.enqueue(v);
                } else if (v.endRoad == "south" || v.endRoad == "west") {
                    this.southL.enqueue(v);
                }
                break;
            case "east":
                if (v.endRoad == "west" || v.endRoad == "north") {
                    this.eastSR.enqueue(v);
                } else if (v.endRoad == "east" || v.endRoad == "south") {
                    this.eastL.enqueue(v);
                }
                break;
            case "west":
                if (v.endRoad == "east" || v.endRoad == "south") {
                    this.westSR.enqueue(v);
                } else if (v.endRoad == "west" || v.endRoad == "north") {
                    this.westL.enqueue(v);
                }
                break;
        }
    }

    pedestrianRequest(crossing: Direction): void {
        // Only allow pedestrian requests when their light is red
        switch (crossing) {
            case "north":
                if (this.state.output.ns.ped == "red") {
                    this.pedRequestN = true;
                }
                break;
            case "south":
                if (this.state.output.ns.ped == "red") {
                    this.pedRequestS = true;
                }
                break;
            case "east":
                if (this.state.output.ew.ped == "red") {
                    this.pedRequestE = true;
                }
                break;
            case "west":
                if (this.state.output.ew.ped == "red") {
                    this.pedRequestW = true;
                }
                break;
        }
    }

    /**
     * @returns Vehicles that left the intersection during this step
     */
    step(): Vehicle[] {
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

        const carsNS_SR = this.northSR.getCount() + this.southSR.getCount();
        const carsNS_L = this.northL.getCount() + this.southL.getCount();
        const carsEW_SR = this.eastSR.getCount() + this.westSR.getCount();
        const carsEW_L = this.eastL.getCount() + this.westL.getCount();

        // State transitions
        const result = this.strategy.execute(
            this.state,
            this.prefs,
            carsNS_SR,
            carsNS_L,
            carsEW_SR,
            carsEW_L,
            this.pedRequestN,
            this.pedRequestS,
            this.timer,
        );
        if (result.changeState) {
            this.state = this.states[result.nextStateIndex];
            this.timer = 0;
            this.metrics?.endCycle();

            // Reset pedestrian requests when lights change
            switch (this.state.name) {
                case "NS_SR":
                    this.pedRequestE = false;
                    this.pedRequestW = false;
                    break;
                case "EW_SR":
                    this.pedRequestN = false;
                    this.pedRequestS = false;
                    break;
            }
        } else {
            this.timer++;
        }

        if (this.metrics) {
            this.metrics.addCarPerStep(leftVehicles.length);
            switch (this.state.name) {
                case "NS_SR": {
                    const waiting =
                        this.northL.getCount() +
                        this.southL.getCount() +
                        this.eastSR.getCount() +
                        this.westSR.getCount() +
                        this.eastL.getCount() +
                        this.westL.getCount();
                    this.metrics.addCarsWaiting(waiting);

                    const went = this.northSR.getCount();
                    this.metrics.addCarPerCycle(went);
                    break;
                }
                case "NS_L":
                case "EW_SR":
                case "EW_L":
            }
        }

        log("leftVehicles", leftVehicles, "\n");

        return leftVehicles;
    }

    getStateData(): StateSnapshot {
        return {
            lights: {
                ns: this.state.output.ns,
                ew: this.state.output.ew,
            },
            cars: {
                n_sr: this.northSR.getAll(),
                n_l: this.northL.getAll(),
                s_sr: this.southSR.getAll(),
                s_l: this.southL.getAll(),
                e_sr: this.eastSR.getAll(),
                e_l: this.eastL.getAll(),
                w_sr: this.westSR.getAll(),
                w_l: this.westL.getAll(),
            },
            pedestrianRequestN: this.pedRequestN,
            pedestrianRequestS: this.pedRequestS,
            pedestrianRequestE: this.pedRequestE,
            pedestrianRequestW: this.pedRequestW,
        };
    }
}
