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

const StateSnapshotSchema = z.object({
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
    pedestrianRequestN: z.boolean(),
    pedestrianRequestS: z.boolean(),
    pedestrianRequestE: z.boolean(),
    pedestrianRequestW: z.boolean(),
});

export const RecordingSchema = z.object({
    commands: z.array(
        z.object({
            type: z.enum(["addVehicle", "pedestrianRequest", "step"]),
            data: StateSnapshotSchema,
        }),
    ),
});

export type Recording = z.infer<typeof RecordingSchema>;

export type StateSnapshot = z.infer<typeof RecordingSchema>["commands"][number];
