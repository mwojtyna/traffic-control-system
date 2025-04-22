import { describe, it, expect } from "vitest";
import { Sim } from "./sim.js";
import { Config, Input, SimRecording, StateSnapshot } from "./io.js";
import fs from "fs";
import path from "path";

// Load test cases
const casesDir = path.resolve(import.meta.dirname, "../testdata");

function loadJSON(filePath: string) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

describe("compare with expected output", () => {
    const testDirs = fs
        .readdirSync(casesDir)
        .filter((d) => fs.statSync(path.join(casesDir, d)).isDirectory());

    for (const dir of testDirs) {
        const testPath = path.join(casesDir, dir);
        const config: Config = JSON.parse(
            fs.readFileSync(path.join(testPath, "config.json"), "utf-8"),
        );
        const inputPath = path.join(testPath, "input.json");
        const expectedPath = path.join(testPath, "expected.json");

        it(`runs simulation correctly for case "${dir}"`, () => {
            const sim = new Sim(config);
            const { commands }: Input = loadJSON(inputPath);
            const expected: StateSnapshot = loadJSON(expectedPath);

            const snapshot: SimRecording = { commands: [] };
            for (const command of commands) {
                if (command.type === "addVehicle") {
                    sim.addVehicle(
                        { id: command.vehicleId, endRoad: command.endRoad },
                        command.startRoad,
                    );
                } else if (command.type === "pedestrianRequest") {
                    sim.pedestrianRequest(command.crossing);
                } else if (command.type === "step") {
                    sim.step();
                }
                snapshot.commands.push({ type: command.type, data: sim.getStateData() });
            }

            expect(snapshot).toEqual(expected);
        });
    }
});
