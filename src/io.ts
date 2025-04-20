import { open, readFile } from "node:fs/promises";
import { z } from "zod";

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

const InputSchema = z.object({
    config: ConfigSchema.optional(),
    commands: z.array(CommandSchema),
});

export type StateConfig = z.infer<typeof StateConfigSchema>;
export type StateName = z.infer<typeof StateNameSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type Road = z.infer<typeof RoadSchema>;
export type Input = z.infer<typeof InputSchema>;

type StepStatus = {
    leftVehicles: string[];
};

export type Output = {
    stepStatuses: StepStatus[];
};

export async function readInput(fileName: string): Promise<Input> {
    const file = await readFile(fileName);
    const input = JSON.parse(file.toString()) as Input;
    await InputSchema.parseAsync(input);
    return input;
}

export async function writeOutput(fileName: string, output: Output): Promise<void> {
    const file = await open(fileName, "w");
    await file.writeFile(JSON.stringify(output, null, 4));
}
