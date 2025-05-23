import { open, readFile } from "node:fs/promises";
import { z } from "zod";
import { LightState, Vehicle } from "./sim.js";

// Config
const StateConfigSchema = z.object({
    /** Minimum number of steps before green ends */
    greenMin: z.number(),
    /** Number of cars OVER which greenMin applies, otherwise greenMin = 0 */
    greenMinCarsThreshold: z.number(),
    /** Maximum number of steps before green ends */
    greenMax: z.number(),
    /** cars_stopped/cars_going */
    ratio: z.number(),
    /** Total number of cars SR in both directions UNDER which ratio test applies */
    ratioCarsLimit: z.number(),
});
const StateNameSchema = z.enum(["NS_SR", "NS_L", "EW_SR", "EW_L"]);
export const ConfigSchema = z.object({
    states: z
        .record(StateNameSchema, StateConfigSchema)
        .refine((obj): obj is Required<typeof obj> =>
            StateNameSchema.options.every((key) => obj[key] != null),
        ),
    /** Max number of cars in both directions (e.g. NS) when ped request switches cycle faster */
    pedRequestMaxCars: z.number(),
});

// Command
const DirectionSchema = z.enum(["north", "east", "south", "west"]);
const CommandSchema = z.union([
    z.object({
        type: z.literal("addVehicle"),
        vehicleId: z.string(),
        startRoad: DirectionSchema,
        endRoad: DirectionSchema,
    }),
    z.object({
        type: z.literal("step"),
    }),
    z.object({
        type: z.literal("pedestrianRequest"),
        crossing: DirectionSchema,
    }),
]);

// Input
export const InputSchema = z.object({
    config: ConfigSchema.optional(),
    commands: z.array(CommandSchema),
});

export type StateConfig = z.infer<typeof StateConfigSchema>;
export type StateName = z.infer<typeof StateNameSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type Direction = z.infer<typeof DirectionSchema>;
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
