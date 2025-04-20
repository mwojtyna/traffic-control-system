import { Config, Road, StateConfig, StateName } from "./io.js";
import { error, log } from "./log.js";
import { Queue } from "./queue.js";

type Vehicle = {
    id: string;
    endRoad: Road;
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
    private readonly pedRequestsNS = new Queue<Road>();
    private readonly pedRequestsEW = new Queue<Road>();

    constructor(config: Config) {
        log("config", config.states.NS_SR.greenMin);
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

    pedestrianRequest(road: Road): void {
        if (road == "north" || road == "south") {
            this.pedRequestsNS.enqueue(road);
        } else if (road == "east" || road == "west") {
            this.pedRequestsEW.enqueue(road);
        }
    }

    /**
     * @returns Vehicles that left the intersection during this step
     */
    step(): Vehicle[] {
        log("STEP:");
        log("state", this.state);
        log("timer", this.timer);
        log("pedRequestsNS", this.pedRequestsNS.getCount());
        log("pedRequestsEW", this.pedRequestsEW.getCount());

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
            case "NS_SR":
                this.pedRequestsEW.dequeue();
                if (
                    this.shouldEndStateSR(
                        carsNS_SR > 0 ? carsEW_SR / carsNS_SR : this.state.prefs.ratio,
                        carsNS_SR,
                        carsNS_L,
                        this.pedRequestsNS.getCount(),
                    )
                ) {
                    changedState = true;
                }
                break;
            case "NS_L":
                if (this.shouldEndStateL(carsNS_L)) {
                    changedState = true;
                }
                break;
            case "EW_SR":
                this.pedRequestsNS.dequeue();
                if (
                    this.shouldEndStateSR(
                        carsEW_SR > 0 ? carsNS_SR / carsEW_SR : this.state.prefs.ratio,
                        carsEW_SR,
                        carsEW_L,
                        this.pedRequestsEW.getCount(),
                    )
                ) {
                    changedState = true;
                }
                break;
            case "EW_L":
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
     * @param carRatio - cars_stopped/cars_going
     */
    private shouldEndStateSR(
        carRatio: number,
        carsSR: number,
        carsL: number,
        pedRequests: number,
    ): boolean {
        return (
            (this.timer >= this.state.prefs.greenMin &&
                (carRatio >= this.state.prefs.ratio ||
                    (carsSR == 0 && carsL > 0) ||
                    pedRequests > 0)) ||
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
