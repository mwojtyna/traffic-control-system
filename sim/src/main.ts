import { exit } from "node:process";
import { Config, Input, Output, readInput, SimRecording, writeOutput as writeFile } from "./io.js";
import { Sim } from "./sim.js";
import { fatal, log } from "./log.js";

// 4 because 1st is node, 2nd is index.ts
if (process.argv.length < 4) {
    fatal(`Usage: npm start input.json output.json [recording.json]`);
}

const inputFileName = process.argv[2];
const outputFileName = process.argv[3];
const recordingFileName: string | undefined = process.argv[4];

// Read input
let input: Input;
try {
    input = await readInput(inputFileName);
} catch (e) {
    fatal(`Error reading input file: "${e}"`);
    exit(1);
}
log("input", input);

// Simulate
const defaultConfig: Config = {
    states: {
        NS_SR: { greenMin: 0, greenMax: 5, ratio: 3 / 2 },
        NS_L: { greenMin: 0, greenMax: 3, ratio: 3 / 2 },
        EW_SR: { greenMin: 0, greenMax: 5, ratio: 3 / 2 },
        EW_L: { greenMin: 0, greenMax: 3, ratio: 3 / 2 },
    },
};
const sim = new Sim(input.config ?? defaultConfig);

const output: Output = { stepStatuses: [] };
const recording: SimRecording = { steps: [] };

for (const command of input.commands) {
    switch (command.type) {
        case "addVehicle":
            sim.addVehicle({ id: command.vehicleId, endRoad: command.endRoad }, command.startRoad);
            break;
        case "step":
            const leftVehicles = sim.step();
            output.stepStatuses.push({ leftVehicles: leftVehicles.map((v) => v.id) });
            break;
        case "pedestrianRequest":
            sim.pedestrianRequest(command.road);
            break;
    }
    if (recordingFileName !== undefined) {
        recording.steps.push({
            stepType: command.type,
            data: sim.getStateData(),
        });
    }
}

// Write outputs
try {
    await writeFile(outputFileName, output);
} catch (e) {
    fatal(`Error writing to file: "${e}"`);
    exit(1);
}

if (recordingFileName !== undefined) {
    try {
        await writeFile(recordingFileName, recording);
    } catch (e) {
        fatal(`Error writing to file: "${e}"`);
        exit(1);
    }
}
