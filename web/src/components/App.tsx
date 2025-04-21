import { Recording, RecordingSchema, RecordingState as RecordingStep } from "@/types";
import Controls from "./Controls";
import Display from "./Display";
import { useState } from "react";

const defaultState: RecordingStep = {
    stepType: "addVehicle",
    data: {
        lights: {
            ns: {
                sr: "red",
                l: "red",
                ped: "red",
                cond: "red",
            },
            ew: {
                sr: "red",
                l: "red",
                ped: "red",
                cond: "red",
            },
        },
        cars: {
            n_sr: [],
            n_l: [],
            s_sr: [],
            s_l: [],
            e_sr: [],
            e_l: [],
            w_sr: [],
            w_l: [],
        },
    },
};

export default function App() {
    const [states, setStates] = useState<RecordingStep[]>([]);
    const [currentStateIndex, setCurrentStateIndex] = useState(0);

    return (
        <div className="m-2 flex w-full gap-12">
            <Display state={states[currentStateIndex] ?? defaultState} />

            <Controls
                onNext={() => {
                    if (currentStateIndex + 1 < states.length) {
                        setCurrentStateIndex(currentStateIndex + 1);
                        return true;
                    } else {
                        return false;
                    }
                }}
                onPrevious={() => {
                    if (currentStateIndex - 1 >= 0) {
                        setCurrentStateIndex(currentStateIndex - 1);
                        return true;
                    } else {
                        return false;
                    }
                }}
                onFileChanged={async (file) => {
                    const text = await file.text();
                    const json = JSON.parse(text);

                    let recording: Recording;
                    try {
                        recording = RecordingSchema.parse(json);
                        setStates(recording.steps);
                        console.log(recording.steps);
                    } catch (e) {
                        alert("Error parsing file:\n" + e);
                        return;
                    }
                }}
                firstState={states.length > 0 && currentStateIndex == 0}
                lastState={states.length > 0 && currentStateIndex == states.length - 1}
                disable={states.length == 0}
            />
        </div>
    );
}
