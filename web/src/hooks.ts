import { useEffect, useRef, useState } from "react";

export function useElementWidth<T extends HTMLElement>(): {
    width: number;
    ref: React.RefObject<T | null>;
} {
    const ref = useRef<T>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        const resizeObserver = new ResizeObserver(() => {
            if (element) {
                setWidth(element.clientWidth);
            }
        });

        resizeObserver.observe(element);

        // Set initial width
        setWidth(element.clientWidth);

        return () => resizeObserver.disconnect();
    }, []);

    return { width, ref };
}
