import intersectionImgPath from "@/../assets/intersection.png?url";
import carImgPath from "@/../assets/car.webp?url";
import srGreenImgPath from "@/../assets/sr_green.png?url";
import srRedImgPath from "@/../assets/sr_red.png?url";
import lGreenImgPath from "@/../assets/l_green.png?url";
import lRedImgPath from "@/../assets/l_red.png?url";
import condGreenImgPath from "@/../assets/cond_green.png?url";
import condRedImgPath from "@/../assets/cond_red.png?url";
import pedGreenImgPath from "@/../assets/ped_green.png?url";
import pedRedImgPath from "@/../assets/ped_red.png?url";
import pedRequestImgPath from "@/../assets/ped_request.png?url";
import { StateSnapshot } from "@/types";
import { useElementWidth } from "@/hooks";

type Route = "north" | "south" | "west" | "east";
type Light = "red" | "green";

type Car = {
    id: string;
    endRoad: Route;
};

type Lights = {
    sr: Light;
    l: Light;
    ped: Light;
    cond: Light;
};
type ScreenProps = {
    state: StateSnapshot;
};

const carWidthPercent = 8.5;
const carHeightPercent = 8.5;
const topPercent_N = 27.5;
const topPercent_S = 68.5;
const leftPercent_E = 67;
const leftPercent_W = 26;

export default function Display({ state }: ScreenProps) {
    return (
        <div
            className="relative max-w-[98vh] min-w-[50vw] overflow-clip rounded-xs select-none"
            onMouseDown={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
        >
            <img src={intersectionImgPath} />

            <TrafficLights
                label="north"
                lights={state.data.lights.ns}
                topPercent={14}
                leftPercent={19}
                pedestrianRequest={state.data.pedestrianRequestN}
            />
            <TrafficLights
                label="south"
                lights={state.data.lights.ns}
                topPercent={64}
                leftPercent={61}
                pedestrianRequest={state.data.pedestrianRequestS}
            />
            <TrafficLights
                label="east"
                lights={state.data.lights.ew}
                topPercent={20}
                leftPercent={67}
                pedestrianRequest={state.data.pedestrianRequestE}
            />
            <TrafficLights
                label="west"
                lights={state.data.lights.ew}
                topPercent={60.5}
                leftPercent={15}
                pedestrianRequest={state.data.pedestrianRequestW}
            />

            {state.data.cars.n_sr.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_N - i * carHeightPercent}
                    leftPercent={38.8}
                    rotation={90}
                    car={car}
                />
            ))}
            {state.data.cars.n_l.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_N - i * carHeightPercent}
                    leftPercent={43.8}
                    rotation={90}
                    car={car}
                />
            ))}
            {state.data.cars.s_sr.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_S + i * carHeightPercent}
                    leftPercent={53.7}
                    rotation={-90}
                    car={car}
                />
            ))}
            {state.data.cars.s_l.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_S + i * carHeightPercent}
                    leftPercent={48.7}
                    rotation={-90}
                    car={car}
                />
            ))}
            {state.data.cars.e_sr.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={40.8}
                    leftPercent={leftPercent_E + i * carWidthPercent}
                    rotation={180}
                    car={car}
                />
            ))}
            {state.data.cars.e_l.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={45.7}
                    leftPercent={leftPercent_E + i * carWidthPercent}
                    rotation={180}
                    car={car}
                />
            ))}
            {state.data.cars.w_sr.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={55.5}
                    leftPercent={leftPercent_W - i * carWidthPercent}
                    rotation={0}
                    car={car}
                />
            ))}
            {state.data.cars.w_l.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={50.6}
                    leftPercent={leftPercent_W - i * carWidthPercent}
                    rotation={0}
                    car={car}
                />
            ))}
        </div>
    );
}

type TrafficLightProps = {
    label: Route;
    lights: Lights;
    topPercent: number;
    leftPercent: number;
    pedestrianRequest: boolean;
};

function TrafficLights(props: TrafficLightProps) {
    const { width: divWidth, ref } = useElementWidth<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className="absolute"
            style={{
                top: props.topPercent + "%",
                left: props.leftPercent + "%",
                width: "20%",
            }}
        >
            <p
                className="text-center text-2xl font-bold text-white"
                style={{ fontSize: divWidth * 0.12 }}
            >
                {props.label}
            </p>
            <div className="grid grid-flow-col gap-1">
                {props.pedestrianRequest && (
                    <img
                        className="absolute top-[22%] left-[10%]"
                        src={pedRequestImgPath}
                        width="5%"
                        title="Pedestrian pressed the crossing button"
                    />
                )}
                <img
                    className="mt-auto"
                    src={props.lights.ped === "red" ? pedRedImgPath : pedGreenImgPath}
                />
                <img src={props.lights.l === "red" ? lRedImgPath : lGreenImgPath} />
                <img src={props.lights.sr === "red" ? srRedImgPath : srGreenImgPath} />
                <img
                    className="mt-auto"
                    src={props.lights.cond === "red" ? condRedImgPath : condGreenImgPath}
                />
            </div>
        </div>
    );
}

type CarImgProps = {
    topPercent: number;
    leftPercent: number;
    rotation: number;
    car: Car;
};

function CarImg(props: CarImgProps) {
    const { width: divWidth, ref } = useElementWidth<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className="absolute z-[1] w-[7.5%]"
            title={props.car.id}
            style={{
                top: props.topPercent + "%",
                left: props.leftPercent + "%",
                rotate: props.rotation + "deg",
            }}
        >
            <p
                className="absolute top-[7%] left-[30%] text-center font-mono font-bold text-white"
                style={{ rotate: -props.rotation + "deg", fontSize: divWidth * 0.3 }}
            >
                {props.car.endRoad.at(0)!.toUpperCase()}
            </p>
            <img src={carImgPath} />
        </div>
    );
}
