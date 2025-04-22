import { describe, it, expect, vi } from "vitest";
import { readFile, open } from "node:fs/promises";
import { Input, readInput, writeOutput } from "./io.js";

// Have to mock the entire module for readFile()
vi.mock("node:fs/promises", async () => {
    return {
        readFile: vi.fn(),
        open: vi.fn(),
    };
});

describe("I/O functions", () => {
    it("should parse valid input JSON", async () => {
        const data: Input = {
            config: {
                pedRequestMaxCars: 3,
                states: {
                    NS_SR: {
                        greenMinCarsThreshold: 3,
                        greenMin: 1,
                        greenMax: 5,
                        ratio: 4 / 2,
                        ratioCarsLimit: 5,
                    },
                    NS_L: {
                        greenMinCarsThreshold: 3,
                        greenMin: 0,
                        greenMax: 3,
                        ratio: 4 / 2,
                        ratioCarsLimit: 5,
                    },
                    EW_SR: {
                        greenMinCarsThreshold: 3,
                        greenMin: 1,
                        greenMax: 5,
                        ratio: 4 / 2,
                        ratioCarsLimit: 5,
                    },
                    EW_L: {
                        greenMinCarsThreshold: 3,
                        greenMin: 0,
                        greenMax: 3,
                        ratio: 4 / 2,
                        ratioCarsLimit: 5,
                    },
                },
            },
            commands: [
                { type: "addVehicle", vehicleId: "n->s-1", startRoad: "north", endRoad: "south" },
                { type: "pedestrianRequest", crossing: "north" },
                { type: "step" },
            ],
        };

        vi.mocked(readFile).mockResolvedValue(JSON.stringify(data));

        const result = await readInput("whatever.json");
        expect(result).toEqual(data);
    });

    it("should throw on invalid input JSON", async () => {
        vi.mocked(readFile).mockResolvedValue("{}");
        await expect(readInput("bad.json")).rejects.toThrow();
    });

    it("should write JSON to file", async () => {
        const writeFile = vi.fn();
        const close = vi.fn();
        vi.mocked(open, { partial: true }).mockResolvedValue({ writeFile, close });

        const data = { ok: true };
        await writeOutput("out.json", data);

        expect(writeFile).toHaveBeenCalledWith(JSON.stringify(data, null, 4));
        expect(close).toHaveBeenCalled();
    });
});
