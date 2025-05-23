import { Recording, RecordingSchema, StateSnapshot } from "@/types";
import Controls from "./Controls";
import Display from "./Display";
import { useState } from "react";

const initialState: StateSnapshot = {
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
        <div className="m-2 flex w-full gap-12 max-md:flex-col">
            <Display state={states[currentStateIndex] ?? initialState} />

            <Controls
                onFileChanged={onFileChanged}
                onIndexChanged={(i) => setCurrentStateIndex(i)}
                disable={states.length == 0}
                state={
                    states[currentStateIndex]
                        ? {
                              type: states[currentStateIndex].type,
                              index: currentStateIndex,
                          }
                        : null
                }
                stateCount={states.length}
            />
        </div>
    );
}
