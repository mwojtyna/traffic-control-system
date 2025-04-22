import { StateSnapshot } from "@/types";
import { useEffect, useRef, useState } from "react";

type ControlsProps = {
    onFileChanged: (file: File) => void;
    onIndexChanged: (index: number) => void;

    disable: boolean;
    state: { index: number; type: StateSnapshot["type"] } | null;
    stateCount: number;
};

export default function Controls({
    onFileChanged,
    state,
    stateCount,
    onIndexChanged,
    ...props
}: ControlsProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const copy = fileRef.current!;
        const handler = async () => {
            if (copy.files?.length == 1) {
                onFileChanged(copy.files[0]);
            }
        };

        copy.addEventListener("input", handler);
        return () => copy.removeEventListener("input", handler);
    }, [onFileChanged]);

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                if (state && state.index < stateCount - 1) {
                    onIndexChanged(state.index + 1);
                } else {
                    setIsPlaying(false); // Stop when we reach the end
                }
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isPlaying, state, stateCount, onIndexChanged]);

    return (
        <div className="mx-auto my-auto flex flex-col gap-10 text-lg">
            <div className="flex flex-col gap-1">
                <label className="text-xl font-bold" htmlFor="file">
                    Read simulation state
                </label>
                <input
                    ref={fileRef}
                    className="rounded border border-gray-500 bg-transparent px-2 py-1 font-semibold text-gray-700 transition-colors hover:border-transparent hover:bg-gray-600 hover:text-white"
                    type="file"
                    id="file"
                    accept=".json"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xl font-bold">Controls</label>

                <div className="space-y-3">
                    <div className="flex w-full gap-3">
                        <input
                            className="w-full accent-blue-500"
                            type="range"
                            min={1}
                            max={stateCount}
                            value={state ? state.index + 1 : 0}
                            onChange={(e) => onIndexChanged(e.currentTarget.valueAsNumber - 1)}
                        />
                        <pre className="font-bold">
                            {state ? state.index + 1 : 0}/{stateCount}
                        </pre>
                    </div>

                    <div className="flex gap-2">
                        <ControlButton
                            onClick={() => onIndexChanged(state!.index - 1)}
                            disabled={state?.index === 0 || props.disable}
                        >
                            Previous
                        </ControlButton>
                        <ControlButton
                            onClick={() => onIndexChanged(state!.index + 1)}
                            disabled={state?.index === stateCount - 1 || props.disable}
                        >
                            Next
                        </ControlButton>
                        <ControlButton
                            onClick={() => {
                                if (state!.index === stateCount - 1) {
                                    onIndexChanged(0);
                                }
                                setIsPlaying((prev) => !prev);
                            }}
                            disabled={props.disable}
                        >
                            {isPlaying ? "Pause" : "Play"}
                        </ControlButton>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xl font-bold">Command details</label>
                <pre>
                    <p>type: {state?.type ?? "N/A"}</p>
                </pre>
            </div>
        </div>
    );
}

function ControlButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400 active:border-b-0 disabled:cursor-not-allowed disabled:rounded disabled:border-b-0 disabled:bg-blue-500 disabled:px-4 disabled:py-2 disabled:font-bold disabled:text-white disabled:opacity-50"
        />
    );
}
