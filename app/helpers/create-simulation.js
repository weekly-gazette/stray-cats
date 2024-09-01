class CatPopulation {
    constructor(time, cats, timeStep, maturityTime, recoveryTime, litterSize) {
        this.time = time;
        this.cats = cats;
        this.timeStep = timeStep; // Time step in months

        this.maturityTime = maturityTime;
        this.recoveryTime = recoveryTime;
        this.litterSize = litterSize;
    }

    simulate() {
        for (const cat of this.cats) {
            cat.exist();
        }

        this.time += this.timeStep;
    }

    addCat(cat) {
        this.cats.push(cat);
    }

    getInformation() {
        return this.cats.map((c) => ({ gender: c.gender, time: this.time }));
    }
}

class Cat {
    constructor(age, gender, simulation) {
        this.simulation = simulation;
        this.age = age; // Age in months
        this.gender = gender;
        this.lastLitterTime = null; // Last litter using time in months
    }

    exist() {
        this.age += this.simulation.timeStep;

        // If cat is of age, reproduce
        const isOfAge = this.age >= this.simulation.maturityTime;
        const isRecovered = (this.simulation.time - this.lastLitterTime) >= this.simulation.recoveryTime;
        const isFemale = this.gender === 'Female';

        if (isOfAge && isRecovered && isFemale) this.reproduce();
    }

    reproduce() {
        for (let i = 0; i < this.simulation.litterSize; i++) {
            const gender = ['Male', 'Female'][Math.floor(Math.random() * 2)];
            const babyCat = new Cat(0, gender, this.simulation);

            this.simulation.addCat(babyCat);

            this.lastLitterTime = this.simulation.time;
        }
    }
}

export default function createSimulation(
    litterSize,
    maturityTime,
    recoveryTime,
    simulationTimeStep,
    simulationMonths,
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