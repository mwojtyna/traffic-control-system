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
