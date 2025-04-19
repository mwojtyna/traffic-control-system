import { open, readFile } from "node:fs/promises";

export type Input = {
    commands: Command[];
};
export type Command = {
    type: CommandType;
    vehicleId: string;
    startRoad: Road;
    endRoad: Road;
};
export type Output = {
    stepStatuses: StepStatus[];
};
export type StepStatus = {
    leftVehicles: string[];
};

export type CommandType = "addVehicle" | "step";
export type Road = "north" | "east" | "south" | "west";

export async function readInput(fileName: string): Promise<Input> {
    const file = await readFile(fileName);
    const input = JSON.parse(file.toString()) as Input;
    return input;
}

export async function writeOutput(fileName: string, output: Output): Promise<void> {
    const file = await open(fileName, "w");
    await file.writeFile(JSON.stringify(output));
}
