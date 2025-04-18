import { exit } from "node:process";
import { type Input, readInput } from "./io.js";
import { Sim } from "./sim.js";

// 4 because 1st is node, 2nd is index.ts
if (process.argv.length != 4) {
    console.error(`Usage: npm start input.json output.json`);
    exit(1);
}

const inputFileName = process.argv[2];
const outputFileName = process.argv[3];

let input: Input;
try {
    input = await readInput(inputFileName);
} catch (e) {
    console.error(`Error reading input file: "${e}"`);
    exit(1);
}

const sim = new Sim(0.6, 5, 10);
for (const command of input.commands) {
    switch (command.type) {
        case "addVehicle":
            sim.addVehicle(command.vehicleId, command.startRoad, command.endRoad);
            break;
        case "step":
            // TODO: step
            break;
    }
}
