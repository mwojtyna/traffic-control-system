import { z } from "zod";

const VehicleSchema = z.object({
    id: z.string(),
    endRoad: z.enum(["north", "east", "south", "west"]),
});

const LightSchema = z.enum(["red", "green"]);
const LightStateSchema = z.object({
    sr: LightSchema,
    l: LightSchema,
    ped: LightSchema,
    cond: LightSchema,
});

const StateDataSchema = z.object({
    lights: z.object({
        ns: LightStateSchema,
        ew: LightStateSchema,
    }),
    cars: z.object({
        n_sr: z.array(VehicleSchema),
        n_l: z.array(VehicleSchema),
        s_sr: z.array(VehicleSchema),
        s_l: z.array(VehicleSchema),
        e_sr: z.array(VehicleSchema),
        e_l: z.array(VehicleSchema),
        w_sr: z.array(VehicleSchema),
        w_l: z.array(VehicleSchema),
    }),
});

export const RecordingSchema = z.object({
    steps: z.array(
        z.object({
            stepType: z.enum(["addVehicle", "pedestrianRequest", "step"]),
            data: StateDataSchema,
        }),
    ),
});

export type Recording = z.infer<typeof RecordingSchema>;

export type RecordingState = z.infer<typeof RecordingSchema>["steps"][number];
