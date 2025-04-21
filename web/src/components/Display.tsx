import intersectionImgPath from "@/assets/intersection.png?url";
import carImgPath from "@/assets/car.webp?url";

type Route = "north" | "south" | "west" | "east";

type Car = {
    end: Route;
};

type ScreenProps = {
    state: {
        N_SR: Car[];
        N_L: Car[];
        S_SR: Car[];
        S_L: Car[];
        E_SR: Car[];
        E_L: Car[];
        W_SR: Car[];
        W_L: Car[];
    };
};

const carWidthPercent = 8.5;
const carHeightPercent = 8.5;
const topPercent_N = 27.5;
const topPercent_S = 68.5;
const leftPercent_E = 67;
const leftPercent_W = 17.3;

export default function Display({ state }: ScreenProps) {
    return (
        <div className="pointer-events-none relative m-2 w-[66%] rounded-xs">
            <img src={intersectionImgPath} />

            {state.N_SR.map((_, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_N - i * carHeightPercent}
                    leftPercent={38.8}
                    rotation={90}
                />
            ))}
            {state.N_L.map((_, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_N - i * carHeightPercent}
                    leftPercent={43.8}
                    rotation={90}
                />
            ))}
            {state.S_SR.map((_, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_S + i * carHeightPercent}
                    leftPercent={53.7}
                    rotation={-90}
                />
            ))}
            {state.S_L.map((_, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_S + i * carHeightPercent}
                    leftPercent={48.7}
                    rotation={-90}
                />
            ))}
            {state.E_SR.map((_, i) => (
                <CarImg
                    key={i}
                    topPercent={40.8}
                    leftPercent={leftPercent_E + i * carWidthPercent}
                    rotation={180}
                />
            ))}
            {state.E_L.map((_, i) => (
                <CarImg
                    key={i}
                    topPercent={45.7}
                    leftPercent={leftPercent_E + i * carWidthPercent}
                    rotation={180}
                />
            ))}
            {state.W_SR.map((_, i) => (
                <CarImg
                    key={i}
                    topPercent={55.5}
                    leftPercent={leftPercent_W + i * carWidthPercent}
                    rotation={0}
                />
            ))}
            {state.W_L.map((_, i) => (
                <CarImg
                    key={i}
                    topPercent={50.6}
                    leftPercent={leftPercent_W + i * carWidthPercent}
                    rotation={0}
                />
            ))}
        </div>
    );
}

type CarImgProps = {
    topPercent: number;
    leftPercent: number;
    rotation: number;
};
function CarImg(props: CarImgProps) {
    return (
        <img
            className="absolute"
            src={carImgPath}
            width={"7.5%"}
            style={{
                top: props.topPercent + "%",
                left: props.leftPercent + "%",
                rotate: props.rotation + "deg",
            }}
        />
    );
}
