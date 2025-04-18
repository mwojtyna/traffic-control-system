import { readFile } from "node:fs/promises";
import { Input } from "./types.js";
import { exit } from "node:process";

// 4 because 1st is node, 2nd is index.ts
if (process.argv.length != 4) {
    console.error(`Usage: npm start input.json output.json`);
    exit(1);
}

const inputFileName = process.argv[2];
const outputFileName = process.argv[3];

let inputFile: Buffer<ArrayBufferLike>;
try {
    inputFile = await readFile(inputFileName);
} catch {
    console.error(`Failed to open input file '${inputFileName}'`);
    exit(1);
}

let input: Input;
try {
    input = JSON.parse(inputFile.toString()) as Input;
} catch {
    console.error(`Failed to parse input file '${inputFileName}'`);
    exit(1);
}

console.log(input);
