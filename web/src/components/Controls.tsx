import { useEffect, useRef } from "react";

type ControlsProps = {
    onNext: () => void;
    onPrevious: () => void;
    onFileChanged: (file: File) => void;
    firstState: boolean;
    lastState: boolean;
    disable: boolean;
};

export default function Controls({ onFileChanged, ...props }: ControlsProps) {
    const fileRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className="mx-auto my-auto flex flex-col gap-6 text-lg">
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
                <div className="flex gap-2">
                    <ControlButton
                        onClick={props.onPrevious}
                        disabled={props.firstState || props.disable}
                    >
                        Previous
                    </ControlButton>
                    <ControlButton disabled={props.disable}>Play/Pause</ControlButton>
                    <ControlButton
                        onClick={props.onNext}
                        disabled={props.lastState || props.disable}
                    >
                        Next
                    </ControlButton>
                </div>
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
