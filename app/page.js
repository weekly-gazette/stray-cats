'use client'
import * as Plot from '@observablehq/plot';
import * as d3 from 'd3';
import { useRef, useState, useEffect } from 'react';
import createSimulation from "@/app/helpers/create-simulation";

export default function Home() {
  const containerRef = useRef();
  const [data, setData] = useState();

    const [litterSize, setLitterSize] = useState(3); // Surviving litter size of 3, though totals can be 7+
    const [maturityTime, setMaturityTime] = useState(6); // Six months of age to reproduce
    const [recoveryTime, setRecoveryTime] = useState(3); // Three months between litters
    const [simulationTimeStep, setSimulationTimeStep] = useState(3);
    const [simulationMonths, setSimulationMonths] = useState(24);

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
        );

        setData(myData);
    }, []);

    useEffect(() => {
        if (data === undefined) return;

        const plot = addAnimation(Plot.waffleY(
            data,
            Plot.groupZ(
                { y: "count" },
                { fill: "gender", sort: "gender", fx: "time", unit: 1 }))
                    .plot({ fx: { interval: 3, label: "Number of Months" }, y: { label: "Number of Cats" }, color: { legend: true } }
        ));

        const cells = document.querySelectorAll('.cell');

        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.classList.add('fade-in');
            }, index * 100); // Adjust the delay for a smoother effect
        });

        containerRef.current.append(plot);

        return () => plot.remove();
    }, [data]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-36">
      <div ref={containerRef}></div>
    </main>
  );
}
