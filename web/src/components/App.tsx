import Controls from "./Controls";
import Display from "./Display";

export default function App() {
    // const [states, setStates] = useState<State[]>([]);
    return (
        <div className="m-2 flex w-full gap-4">
            <Display
                state={{
                    cars: {
                        n_sr: [{ end: "south" }, { end: "south" }],
                        n_l: [{ end: "east" }, { end: "east" }],
                        s_sr: [{ id: "ID", end: "north" }, { end: "north" }],
                        s_l: [{ end: "west" }, { end: "west" }],
                        e_sr: [{ end: "west" }, { end: "west" }],
                        e_l: [{ end: "south" }, { end: "south" }],
                        w_sr: [{ end: "east" }, { end: "east" }],
                        w_l: [{ end: "north" }, { end: "north" }],
                    },
                    lights: {
                        ns: {
                            sr: "green",
                            l: "red",
                            ped: "red",
                            cond: "red",
                        },
                        ew: {
                            sr: "red",
                            l: "red",
                            ped: "green",
                            cond: "green",
                        },
                    },
                }}
            />

            <Controls
                onNext={() => {
                    console.log("next");
                    return false;
                }}
                onPrevious={() => console.log("previous")}
            />
        </div>
    );
}
