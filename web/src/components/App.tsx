import { Recording, RecordingSchema, StateSnapshot } from "@/types";
import Controls from "./Controls";
import Display from "./Display";
import { useState } from "react";

const defaultState: StateSnapshot = {
    type: "addVehicle",
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
        pedestrianRequestN: false,
        pedestrianRequestS: false,
        pedestrianRequestE: false,
        pedestrianRequestW: false,
    },
};

export default function App() {
    const [states, setStates] = useState<StateSnapshot[]>([]);
    const [currentStateIndex, setCurrentStateIndex] = useState(0);

    function onNext() {
        if (currentStateIndex + 1 < states.length) {
            setCurrentStateIndex(currentStateIndex + 1);
            return true;
        } else {
            return false;
        }
    }
    function onPrevious() {
        if (currentStateIndex - 1 >= 0) {
            setCurrentStateIndex(currentStateIndex - 1);
            return true;
        } else {
            return false;
        }
    }
    async function onFileChanged(file: File) {
        const text = await file.text();
        const json = JSON.parse(text);

        let recording: Recording;
        try {
            recording = RecordingSchema.parse(json);
            setStates(recording.commands);
            setCurrentStateIndex(0);
        } catch (e) {
            alert("Error parsing file:\n" + e);
            return;
        }
    }

    return (
        <div className="m-2 flex w-full gap-12">
            <Display state={states[currentStateIndex] ?? defaultState} />

            <Controls
                onNext={onNext}
                onPrevious={onPrevious}
                onFileChanged={onFileChanged}
                firstState={states.length > 0 && currentStateIndex == 0}
                lastState={states.length > 0 && currentStateIndex == states.length - 1}
                disable={states.length == 0}
                command={
                    states[currentStateIndex]
                        ? {
                              type: states[currentStateIndex].type,
                              index: currentStateIndex,
                          }
                        : null
                }
                commandCount={states.length}
            />
        </div>
    );
}
