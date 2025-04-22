import fs from "fs";
import path from "path";
import { Config, Input, SimRecording } from "./src/io.js";
import { Sim } from "./src/sim.js";

const casesDir = path.resolve(import.meta.dirname, "testdata");

function loadJSON(filePath: string) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveJSON(filePath: string, data: any) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

function generateExpected(testCaseDir: string, config: Config) {
    const inputPath = path.join(testCaseDir, "input.json");
    const { commands }: Input = loadJSON(inputPath);

    const sim = new Sim(config);

    const snapshot: SimRecording = { commands: [] };
    for (const command of commands) {
        if (command.type === "addVehicle") {
            sim.addVehicle({ id: command.vehicleId, endRoad: command.endRoad }, command.startRoad);
        } else if (command.type === "pedestrianRequest") {
            sim.pedestrianRequest(command.crossing);
        } else if (command.type === "step") {
            sim.step();
        }
        snapshot.commands.push({ type: command.type, data: sim.getStateData() });
    }

    const expectedPath = path.join(testCaseDir, "expected.json");
    saveJSON(expectedPath, snapshot);
    console.log(`✅ Generated expected output for: ${path.basename(testCaseDir)}`);
}

const testDirs = fs
    .readdirSync(casesDir)
    .map((d) => path.join(casesDir, d))
    .filter((d) => fs.statSync(d).isDirectory());

for (const dir of testDirs) {
    const configPath = path.join(dir, "config.json");
    const config: Config = loadJSON(configPath);
    generateExpected(dir, config);
}
