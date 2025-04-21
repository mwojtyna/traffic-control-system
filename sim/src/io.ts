import { open, readFile } from "node:fs/promises";
import { z } from "zod";
import { LightState, Vehicle } from "./sim.js";

// Config
const StateConfigSchema = z.object({
    /** Minimum number of steps before green ends */
    greenMin: z.number(),
    /** Maximum number of steps before green ends */
    greenMax: z.number(),
    /** cars_stopped/cars_going */
    ratio: z.number(),
});
const StateNameSchema = z.enum(["NS_SR", "NS_L", "EW_SR", "EW_L"]);
const ConfigSchema = z.object({
    states: z
        .record(StateNameSchema, StateConfigSchema)
        .refine((obj): obj is Required<typeof obj> =>
            StateNameSchema.options.every((key) => obj[key] != null),
        ),
});

// Command
const RoadSchema = z.enum(["north", "east", "south", "west"]);
const CommandSchema = z.union([
    z.object({
        type: z.literal("addVehicle"),
        vehicleId: z.string(),
        startRoad: RoadSchema,
        endRoad: RoadSchema,
    }),
    z.object({
        type: z.literal("step"),
    }),
    z.object({
        type: z.literal("pedestrianRequest"),
        road: RoadSchema,
    }),
]);

// Input
const InputSchema = z.object({
    config: ConfigSchema.optional(),
    commands: z.array(CommandSchema),
});

export type StateConfig = z.infer<typeof StateConfigSchema>;
export type StateName = z.infer<typeof StateNameSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type Road = z.infer<typeof RoadSchema>;
export type Command = z.infer<typeof CommandSchema>;
export type CommandType = Command["type"];
export type Input = z.infer<typeof InputSchema>;

// Output
type StepStatus = {
    leftVehicles: string[];
};
export type Output = {
    stepStatuses: StepStatus[];
};

// Recording
export type StateSnapshot = {
    lights: {
        ns: LightState;
        ew: LightState;
    };
    cars: {
        n_sr: Vehicle[];
        n_l: Vehicle[];
        s_sr: Vehicle[];
        s_l: Vehicle[];
        e_sr: Vehicle[];
        e_l: Vehicle[];
        w_sr: Vehicle[];
        w_l: Vehicle[];
    };
    pedestrianRequestN: boolean;
    pedestrianRequestS: boolean;
    pedestrianRequestE: boolean;
    pedestrianRequestW: boolean;
};
export type SimRecording = {
    commands: { type: CommandType; data: StateSnapshot }[];
};

export async function readInput(fileName: string): Promise<Input> {
    const file = await readFile(fileName);
    const json = JSON.parse(file.toString());
    const input = InputSchema.parse(json);
    return input;
}

export async function writeOutput<T>(fileName: string, data: T): Promise<void> {
    const file = await open(fileName, "w");
    await file.writeFile(JSON.stringify(data, null, 4));
    await file.close();
    console.log(`Wrote data to ${fileName}`);
}
