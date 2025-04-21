import { useEffect, useRef } from "react";

type ControlsProps = {
    /** @returns Whether the simulation ended */
    onNext: () => boolean;
    onPrevious: () => void;
};

export default function Controls(props: ControlsProps) {
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const copy = fileRef.current!;
        const handler = async () => {
            if (copy.files?.length == 1) {
                const text = await copy.files[0].text();
                console.log(text);
            }
        };

        copy.addEventListener("input", handler);
        return () => copy.removeEventListener("input", handler);
    }, []);

    return (
        <div className="flex flex-col text-lg">
            <div className="flex flex-col gap-2">
                <label className="text-xl font-bold" htmlFor="file">
                    Read simulation state
                </label>
                <input
                    ref={fileRef}
                    className="rounded border border-gray-500 bg-transparent px-2 py-1 font-semibold text-gray-700 transition-colors hover:cursor-pointer hover:border-transparent hover:bg-gray-600 hover:text-white"
                    type="file"
                    id="file"
                    accept=".json"
                />
            </div>
        </div>
    );
}
