import { Prefs, State } from "./sim.js";

type ExecuteReturnType =
    | {
          changeState: true;
          nextStateIndex: number;
      }
    | {
          changeState: false;
      };

export interface Strategy {
    execute(
        state: State,
        prefs: Prefs,
        carsNS_SR: number,
        carsNS_L: number,
        carsEW_SR: number,
        carsEW_L: number,
        pedRequestN: boolean,
        pedRequestS: boolean,
        timer: number,
    ): ExecuteReturnType;
}

export class MyStrategy implements Strategy {
    nextIndexMap: Record<string, number> = {
        NS_SR: 1,
        NS_L: 2,
        EW_SR: 3,
        EW_L: 0,
    };

    execute(
        state: State,
        prefs: Prefs,
        carsNS_SR: number,
        carsNS_L: number,
        carsEW_SR: number,
        carsEW_L: number,
        pedRequestN: boolean,
        pedRequestS: boolean,
        timer: number,
    ): ExecuteReturnType {
        switch (state.name) {
            case "NS_SR":
                if (
                    this.shouldEndStateSR(
                        state,
                        prefs,
                        carsNS_SR > 0 ? carsEW_SR / carsNS_SR : Infinity,
                        carsNS_SR + carsEW_SR,
                        carsNS_SR,
                        carsNS_L,
                        pedRequestN || pedRequestS,
                        timer,
                    )
                ) {
                    return {
                        changeState: true,
                        nextStateIndex: this.nextIndexMap[state.nextStateIndex],
                    };
                }
                break;
            case "NS_L":
                if (this.shouldEndStateL(carsNS_L)) {
                    return true;
                }
                break;
            case "EW_SR":
                if (
                    this.shouldEndStateSR(
                        carsEW_SR > 0 ? carsNS_SR / carsEW_SR : Infinity,
                        carsNS_SR + carsEW_SR,
                        carsEW_SR,
                        carsEW_L,
                        this.pedRequestE || this.pedRequestW,
                    )
                ) {
                    return true;
                }
                break;
            case "EW_L":
                if (this.shouldEndStateL(carsEW_L)) {
                    return true;
                }
                break;
        }

        return {
            changeState: false,
        };
    }

    /**
     * @param carRatio - cars_stopped/cars_going
     */
    private shouldEndStateSR(
        state: State,
        prefs: Prefs,
        carRatio: number,
        carsSRTotal: number,
        carsSR: number,
        carsL: number,
        pedRequest: boolean,
        timer: number,
    ): boolean {
        let min = state.prefs.greenMin;
        if (carsSR <= state.prefs.greenMinCarsThreshold) {
            min = 0;
        }

        return (
            (timer >= min &&
                ((carsSRTotal <= state.prefs.ratioCarsLimit && carRatio >= state.prefs.ratio) ||
                    (carsSR == 0 && carsL > 0) ||
                    (pedRequest && carsSR <= prefs.pedRequestMaxCars))) ||
            timer >= state.prefs.greenMax
        );
    }

    private shouldEndStateL(state: State, carsAmount: number, timer: number): boolean {
        return (timer >= state.prefs.greenMin && carsAmount == 0) || timer >= state.prefs.greenMax;
    }
}
