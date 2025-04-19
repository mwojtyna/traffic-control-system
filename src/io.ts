import { open, readFile } from "node:fs/promises";

export type Road = "north" | "east" | "south" | "west";

type Command =
    | {
          type: "addVehicle";
          vehicleId: string;
          startRoad: Road;
          endRoad: Road;
      }
    | {
          type: "step";
      }
    | {
          type: "pedestrianRequest";
          road: Road;
      };

export type Input = {
    commands: Command[];
};

export type Output = {
    stepStatuses: StepStatus[];
};

type StepStatus = {
    leftVehicles: string[];
};

export async function readInput(fileName: string): Promise<Input> {
    const file = await readFile(fileName);
    const input = JSON.parse(file.toString()) as Input;
    return input;
}

export async function writeOutput(fileName: string, output: Output): Promise<void> {
    const file = await open(fileName, "w");
    await file.writeFile(JSON.stringify(output));
}
