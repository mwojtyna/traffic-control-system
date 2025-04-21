import Controls from "./Controls";
import Display from "./Display";

export default function App() {
    return (
        <div className="m-2 flex w-full gap-4">
            <Display
                state={{
                    N_SR: [{ end: "south" }, { end: "south" }],
                    N_L: [{ end: "east" }, { end: "east" }],
                    S_SR: [{ id: "CUJ", end: "north" }, { end: "north" }],
                    S_L: [{ end: "west" }, { end: "west" }],
                    E_SR: [{ end: "west" }, { end: "west" }],
                    E_L: [{ end: "south" }, { end: "south" }],
                    W_SR: [{ end: "east" }, { end: "east" }],
                    W_L: [{ end: "north" }, { end: "north" }],
                }}
            />

            <Controls />
        </div>
    );
}
