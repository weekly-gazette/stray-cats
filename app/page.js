'use client'
import * as Plot from '@observablehq/plot';
import * as d3 from 'd3';
import { useRef, useState, useEffect } from 'react';
import { legendColors, createSimulation } from "@/app/helpers/create-simulation";

export default function Home() {
  const containerRef = useRef();
  const [data, setData] = useState();

    const [litterSize, setLitterSize] = useState(3); // Surviving litter size of 3, though totals can be 7+
    const [maturityTime, setMaturityTime] = useState(6); // Six months of age to reproduce
    const [recoveryTime, setRecoveryTime] = useState(6); // Assuming two litters per year
    const [simulationTimeStep, setSimulationTimeStep] = useState(1);
    const [simulationMonths, setSimulationMonths] = useState(24);
    const [simulationTNREvents, setSimulationTNREvents] = useState([{ probability: 0.75, time: 12 }]);

    // Thanks, Mike Freeman
    const addAnimation = (
        plot,
        { type = "path", delay = 50, endValue = 1 } = {}
    ) => {
        const chart = d3.select(plot);

        const marks = chart.selectAll(type).filter(function () {
            return !this.parentNode.classList.contains("tick");
        });

        marks.style('fill-opacity', 0);

        marks
            .transition()
            .duration(500)
            .delay((d, i) => i * delay)
            .style('fill-opacity', 1);

        return chart.node();
    }

    useEffect(() => {
        const myData = createSimulation(
            litterSize,
            maturityTime,
            recoveryTime,
            simulationTimeStep,
            simulationMonths,
            simulationTNREvents,
        );

        setData(myData);
    }, []);

    useEffect(() => {
        if (data === undefined) return;

        const plot = addAnimation(Plot.waffleY(
            data,
            Plot.groupZ(
                { y: "count" },
                { fill: "fillColor", sort: "gender", fx: "time", unit: 1 }))
                    .plot({ fx: { interval: 1, label: "Number of Months" }, y: { label: "Number of Cats", domain: [0, 100] }, color: { legend: true } }
        ));

        containerRef.current.append(plot);

        return () => plot.remove();
    }, [data]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
        <div className="flex gap-8 mb-8">
            {Object.entries(legendColors).map(([name, value]) => {
                return (
                    <div key={name} className="flex items-center justify-center">
                        <div className="h-[10px] w-[10px] mr-1" style={{ backgroundColor: value }}></div>
                        <span className="text-sm text-black">{name}</span>
                    </div>
                );
            })}
        </div>
        <div ref={containerRef}></div>
    </main>
  );
}
