import intersectionImgPath from "@/assets/intersection.png?url";
import carImgPath from "@/assets/car.webp?url";
import { useEffect, useRef, useState } from "react";

type Route = "north" | "south" | "west" | "east";

type Car = {
    id: string;
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
        <div
            className={"relative w-[1000px] rounded-xs select-none"}
            onMouseDown={(e) => e.preventDefault()}
        >
            <img src={intersectionImgPath} />

            {state.N_SR.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_N - i * carHeightPercent}
                    leftPercent={38.8}
                    rotation={90}
                    car={car}
                />
            ))}
            {state.N_L.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_N - i * carHeightPercent}
                    leftPercent={43.8}
                    rotation={90}
                    car={car}
                />
            ))}
            {state.S_SR.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_S + i * carHeightPercent}
                    leftPercent={53.7}
                    rotation={-90}
                    car={car}
                />
            ))}
            {state.S_L.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={topPercent_S + i * carHeightPercent}
                    leftPercent={48.7}
                    rotation={-90}
                    car={car}
                />
            ))}
            {state.E_SR.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={40.8}
                    leftPercent={leftPercent_E + i * carWidthPercent}
                    rotation={180}
                    car={car}
                />
            ))}
            {state.E_L.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={45.7}
                    leftPercent={leftPercent_E + i * carWidthPercent}
                    rotation={180}
                    car={car}
                />
            ))}
            {state.W_SR.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={55.5}
                    leftPercent={leftPercent_W + i * carWidthPercent}
                    rotation={0}
                    car={car}
                />
            ))}
            {state.W_L.map((car, i) => (
                <CarImg
                    key={i}
                    topPercent={50.6}
                    leftPercent={leftPercent_W + i * carWidthPercent}
                    rotation={0}
                    car={car}
                />
            ))}
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
    const divRef = useRef<HTMLDivElement>(null);
    const pRef = useRef<HTMLParagraphElement>(null);
    const [divWidth, setDivWidth] = useState(0);
    useEffect(() => {
        const listener = () => {
            if (divRef.current) {
                setDivWidth(divRef.current.clientWidth);
            }
        };
        if (divRef.current) {
            setDivWidth(divRef.current.clientWidth);
        }
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, []);

    return (
        <div
            ref={divRef}
            className="absolute z-[1] w-[7.5%]"
            title={props.car.id}
            style={{
                top: props.topPercent + "%",
                left: props.leftPercent + "%",
                rotate: props.rotation + "deg",
            }}
        >
            <p
                ref={pRef}
                className="absolute top-[7%] left-[30%] text-center font-mono font-bold text-white"
                style={{ rotate: -props.rotation + "deg", fontSize: divWidth * 0.3 }}
            >
                {props.car.end.at(0)!.toUpperCase()}
            </p>
            <img src={carImgPath} />
        </div>
    );
}
