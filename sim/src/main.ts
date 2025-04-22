import { exit } from "node:process";
import { Config, Input, Output, readInput, SimRecording, writeOutput } from "./io.js";
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
        NS_SR: {
            greenMinCarsThreshold: 3,
            greenMin: 1,
            greenMax: 5,
            ratio: 4 / 2,
            ratioCarsLimit: 5,
        },
        NS_L: {
            greenMinCarsThreshold: 3,
            greenMin: 0,
            greenMax: 3,
            ratio: 4 / 2,
            ratioCarsLimit: 5,
        },
        EW_SR: {
            greenMinCarsThreshold: 3,
            greenMin: 1,
            greenMax: 5,
            ratio: 4 / 2,
            ratioCarsLimit: 5,
        },
        EW_L: {
            greenMinCarsThreshold: 3,
            greenMin: 0,
            greenMax: 3,
            ratio: 4 / 2,
            ratioCarsLimit: 5,
        },
    },
    pedRequestMaxCars: 4,
};
const sim = new Sim(input.config ?? defaultConfig);

const output: Output = { stepStatuses: [] };
const recording: SimRecording = { commands: [] };

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
            sim.pedestrianRequest(command.crossing);
            break;
    }
    if (recordingFileName !== undefined) {
        recording.commands.push({
            type: command.type,
            data: sim.getStateData(),
        });
    }
}

// Write outputs
try {
    await writeOutput(outputFileName, output);
} catch (e) {
    fatal(`Error writing to file: "${e}"`);
    exit(1);
}

if (recordingFileName !== undefined) {
    try {
        await writeOutput(recordingFileName, recording);
    } catch (e) {
        fatal(`Error writing to file: "${e}"`);
        exit(1);
    }
}
