import { exit } from "node:process";
import { type Input, Output, readInput, writeOutput } from "./io.js";
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
const sim = new Sim({
    ns: {
        sr: { greenMin: 0, greenMax: 5 },
        l: { greenMin: 0, greenMax: 3 },
        ratio: 3 / 2,
    },
    ew: {
        sr: { greenMin: 0, greenMax: 5 },
        l: { greenMin: 0, greenMax: 3 },
        ratio: 3 / 2,
    },
});

for (const command of input.commands) {
    switch (command.type) {
        case "addVehicle":
            sim.addVehicle({ id: command.vehicleId, endRoad: command.endRoad }, command.startRoad);
            break;
        case "step":
            const leftVehicles = sim.step();
            output.stepStatuses.push({ leftVehicles: leftVehicles.map((v) => v.id) });
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
