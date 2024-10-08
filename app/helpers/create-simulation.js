export const legendColors = {
    'Male': '#D00101',
    'Female': '#FFBA06',
    'Fixed': '#042B43',
};

class CatPopulation {
    constructor(time, cats, timeStep, maturityTime, recoveryTime, litterSize, simulationTNREvents) {
        this.time = time;
        this.cats = cats;
        this.timeStep = timeStep; // Time step in months

        this.maturityTime = maturityTime;
        this.recoveryTime = recoveryTime;
        this.litterSize = litterSize;
        this.simulationTNREvents = simulationTNREvents;
    }

    simulate() {
        const tnrEvent = this.simulationTNREvents.find((e) => e.time === this.time);

        let fixedCatIndices = new Set();

        if (tnrEvent) {
            const sampleSize = Math.floor(tnrEvent.percentage * this.cats.length);

            while (fixedCatIndices.size < sampleSize) {
                fixedCatIndices.add(Math.floor(Math.random() * this.cats.length));
            }
        }

        for (let i = 0; i < this.cats.length; i++) {
            if (fixedCatIndices.has(i)) this.cats[i].tnr();
            this.cats[i].exist();
        }

        this.time += this.timeStep;
    }

    addCat(cat) {
        this.cats.push(cat);
    }

    getInformation() {
        return this.cats.map((c) => ({
            gender: c.gender,
            isFixed: c.isFixed,
            time: this.time,
            fillColor: c.isFixed ? legendColors['Fixed'] : legendColors[c.gender],
        }));
    }
}

class Cat {
    constructor(age, gender, simulation) {
        this.simulation = simulation;
        this.age = age; // Age in months
        this.gender = gender;
        this.lastLitterTime = null; // Last litter using time in months
        this.isFixed = false;
    }

    exist() {
        this.age += this.simulation.timeStep;

        const isOfAge = this.age >= this.simulation.maturityTime;
        const isRecovered = (this.simulation.time - this.lastLitterTime) >= this.simulation.recoveryTime;
        const isFemale = this.gender === 'Female';

        if (isOfAge && isRecovered && isFemale && !this.isFixed) this.reproduce();
    }

    reproduce() {
        for (let i = 0; i < this.simulation.litterSize; i++) {
            const gender = Math.random() < 0.5 ? 'Female' : 'Male';
            const babyCat = new Cat(0, gender, this.simulation);

            this.simulation.addCat(babyCat);

            this.lastLitterTime = this.simulation.time;
        }
    }

    tnr() {
        this.isFixed = true;
    }
}

export function createSimulation(
    litterSize,
    maturityTime,
    recoveryTime,
    simulationTimeStep,
    simulationMonths,
    simulationTNREvents,
) {
    let data = [];

    // Start at t = 0, no cats
    const catPopulation = new CatPopulation(
        0,
        [],
        simulationTimeStep,
        maturityTime,
        recoveryTime,
        litterSize,
        simulationTNREvents,
    );

    // Add the first cat, which is a 1-year-old female cat
    const firstCat = new Cat(12, 'Female', catPopulation);
    catPopulation.addCat(firstCat);

    for (let cycle = 0; cycle < (simulationMonths / simulationTimeStep); cycle++) {
        catPopulation.simulate();

        data.push(catPopulation.getInformation());
    }

    return data.flat();
}