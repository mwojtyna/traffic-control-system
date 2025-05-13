// ilość samochodów przejeżdżających na cykl
// ilość samochodów przejeżdżających na krok symulacji
// ilość samochodów obecnie stojących na czerwonym obecnie

export class Metrics {
    private readonly carsPerCycle: number[];
    private readonly carsPerStep: number[];
    private readonly carsWaitingPerStep: number[];

    constructor() {
        this.carsPerCycle = [0];
        this.carsPerStep = [];
        this.carsWaitingPerStep = [];
    }

    addCarPerCycle(amount: number) {
        this.carsPerCycle[this.carsPerCycle.length - 1] += amount;
    }
    endCycle() {
        this.carsPerCycle.push(0);
    }

    addCarPerStep(amount: number) {
        this.carsPerStep.push(amount);
    }

    addCarsWaiting(amount: number) {
        this.carsWaitingPerStep.push(amount);
    }
}
