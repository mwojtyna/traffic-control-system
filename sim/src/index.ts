import { exit } from "node:process";
import { Config, Input, Output, readInput, writeOutput } from "./io.js";
import { Sim } from "./sim.js";
import { fatal, log } from "./log.js";

// 4 because 1st is node, 2nd is index.ts
if (process.argv.length != 4) {
    fatal(`Usage: npm start input.json output.json`);
}

const inputFileName = process.argv[2];
const outputFileName = process.argv[3];

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
const output: Output = { stepStatuses: [] };
const defaultConfig: Config = {
    states: {
        NS_SR: { greenMin: 0, greenMax: 5, ratio: 3 / 2 },
        NS_L: { greenMin: 0, greenMax: 3, ratio: 3 / 2 },
        EW_SR: { greenMin: 0, greenMax: 5, ratio: 3 / 2 },
        EW_L: { greenMin: 0, greenMax: 3, ratio: 3 / 2 },
    },
};
const sim = new Sim(input.config ?? defaultConfig);

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
}

// Write output
try {
    await writeOutput(outputFileName, output);
} catch (e) {
    fatal(`Error writing to output file: "${e}"`);
    exit(1);
}
