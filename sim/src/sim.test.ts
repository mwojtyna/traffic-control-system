import { it, expect, describe, beforeEach } from "vitest";
import { Sim, Vehicle } from "./sim.js";
import { Config } from "./io.js";

const mockConfig: Config = {
    states: {
        NS_SR: { greenMin: 0, greenMax: 2, ratio: 1, greenMinCarsThreshold: 0 },
        NS_L: { greenMin: 0, greenMax: 2, ratio: 1, greenMinCarsThreshold: 0 },
        EW_SR: { greenMin: 0, greenMax: 2, ratio: 1, greenMinCarsThreshold: 0 },
        EW_L: { greenMin: 0, greenMax: 2, ratio: 1, greenMinCarsThreshold: 0 },
    },
    pedRequestMaxCars: 10,
};

describe("unit tests", () => {
    let sim: Sim;
    beforeEach(() => {
        sim = new Sim(mockConfig);
    });

    it("initializes with NS_SR state", () => {
        const state = sim.getStateData();
        expect(state.lights.ns.sr).toBe("green");
        expect(state.lights.ew.sr).toBe("red");
    });

    it("adds vehicles to correct lanes", () => {
        sim.addVehicle({ id: "v1", endRoad: "south" }, "north"); // straight
        sim.addVehicle({ id: "v2", endRoad: "north" }, "north"); // left

        const state = sim.getStateData();
        expect(state.cars.n_sr.length).toBe(1);
        expect(state.cars.n_l.length).toBe(1);
    });

    it("sets pedestrian request only if light is red", () => {
        sim.pedestrianRequest("north");
        expect(sim.getStateData().pedestrianRequestN).toBe(true);

        sim.pedestrianRequest("east");
        expect(sim.getStateData().pedestrianRequestE).toBe(false);
    });

    it("removes vehicles on green light", () => {
        sim.addVehicle({ id: "v1", endRoad: "south" }, "north"); // straight

        const left = sim.step();
        expect(left).toEqual([{ id: "v1", endRoad: "south" }]);
    });
});

describe("more complex scenarios", () => {
    const config: Config = {
        pedRequestMaxCars: 2,
        states: {
            NS_SR: {
                greenMin: 1,
                greenMinCarsThreshold: 2,
                greenMax: 3,
                ratio: 1,
            },
            NS_L: {
                greenMin: 1,
                greenMinCarsThreshold: 1,
                greenMax: 3,
                ratio: 1,
            },
            EW_SR: {
                greenMin: 1,
                greenMinCarsThreshold: 2,
                greenMax: 3,
                ratio: 1,
            },
            EW_L: {
                greenMin: 1,
                greenMinCarsThreshold: 1,
                greenMax: 3,
                ratio: 1,
            },
        },
    };

    let sim: Sim;

    beforeEach(() => {
        sim = new Sim(config);
    });

    it("vehicles go straight, left, and peds can cross upon request", () => {
        sim.addVehicle({ id: "a", endRoad: "south" }, "north"); // SR
        sim.addVehicle({ id: "b", endRoad: "north" }, "south"); // SR

        // Vehicles can go straight
        let out = sim.step();
        expect(out.map((v) => v.id)).toContain("a");
        expect(out.map((v) => v.id)).toContain("b");

        out = sim.step(); // transition to NS_L
        out = sim.step();

        // left-turn car
        sim.addVehicle({ id: "c", endRoad: "west" }, "north"); // L
        out = sim.step(); // should process "c"
        expect(out.map((v) => v.id)).toContain("c");

        sim.pedestrianRequest("east");

        // cycle to EW_SR
        sim.step();
        sim.step();
        const state = sim.getStateData();
        expect(state.lights.ns.sr).toBe("green");
        expect(state.pedestrianRequestE).toBe(false); // resets after light change
    });

    it("vehicles leave when lights are green", () => {
        const v1: Vehicle = { id: "v1", endRoad: "south" };
        const v2: Vehicle = { id: "v2", endRoad: "north" };
        sim.addVehicle(v1, "north");
        sim.addVehicle(v2, "south");

        // Initial state is NS_SR, so both should go
        const left = sim.step();
        expect(left.map((v) => v.id).sort()).toEqual(["v1", "v2"]);
    });

    it("pedestrian request speeds up transition when few cars", () => {
        sim.addVehicle({ id: "v3", endRoad: "south" }, "north");
        sim.addVehicle({ id: "v3", endRoad: "south" }, "north");

        // No request, should still be NS_SR
        sim.step();
        expect(sim.getStateData().lights.ns.sr).toBe("green");

        sim.pedestrianRequest("north");

        // Enough steps to satisfy greenMin
        sim.step();
        sim.step(); // Should switch here because of ped request

        // It should now be NS_L
        expect(sim.getStateData().lights.ns.l).toBe("green");
    });

    it("EW light should be green after 4 steps", () => {
        // Fill NS directions a bit
        sim.addVehicle({ id: "v1", endRoad: "south" }, "north");
        sim.step(); // NS_SR
        sim.step(); // NS_L
        sim.step(); // EW_SR
        const state = sim.getStateData().lights.ew.sr;
        expect(state).toBe("green");
    });
});
