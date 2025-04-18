import json
import subprocess
import sys
from typing import Literal, TypedDict, cast

type CommandType = Literal["addVehicle"] | Literal["step"]
type Road = Literal["north"] | Literal["east"] | Literal["south"] | Literal["west"]


class Command(TypedDict):
    type: CommandType
    vehicleId: str
    startRoad: Road
    endRoad: Road


class Input(TypedDict):
    commands: list[Command]


class StepStatus(TypedDict):
    leftVehicles: list[str]


class Output(TypedDict):
    stepStatuses: list[StepStatus]


def main(executable: str, input_file: str, output_file: str) -> None:
    """
    Process input JSON commands and generate output JSON.

    Args:
        input_file: input JSON file.
        output_file: output JSON file.
    """
    with open(input_file) as f:
        data: Input = json.load(f)

    c_commands: list[str] = []
    for cmd in data["commands"]:
        if cmd["type"] == "addVehicle":
            c_commands.append(
                f"ADD_VEHICLE {cmd['vehicleId']} {cmd['startRoad']} {cmd['endRoad']}"
            )
        elif cmd["type"] == "step":
            c_commands.append("STEP")

    # Run the C program and capture output
    process = subprocess.Popen(
        [executable],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True,
    )
    stdout: str
    stdout, _ = process.communicate("\n".join(c_commands))
    print(stdout)

    # Parse output lines into stepStatuses
    # step_statuses: list[StepStatus] = []
    # for line in out.strip().split("\n"):
    #     if not line:
    #         continue
    #     status: StepStatus = json.loads(line)
    #     step_statuses.append(status)
    #
    # with open(output_file, "w") as f:
    #     json.dump({"stepStatuses": step_statuses}, f, indent=2)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python simulate.py path_to_simulator input.json output.json")
        sys.exit(1)

    main(sys.argv[1], sys.argv[2], sys.argv[3])
