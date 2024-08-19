import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChartD3 = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Datos del gráfico
    const data = [
      { day: 'Lunes', value: 25 },
      { day: 'Martes', value: 27 },
      { day: 'Miércoles', value: 26 },
      { day: 'Jueves', value: 28 },
      { day: 'Viernes', value: 25 },
      { day: 'Sábado', value: 27 },
      { day: 'Domingo', value: 28 },
    ];

    // Dimensiones del gráfico
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Crear el svg
    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Configurar los ejes
    const x = d3.scalePoint()
      .domain(data.map(d => d.day))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([24, 29])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    // Crear la línea
    const line = d3.line()
      .x(d => x(d.day))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Crear los puntos
    svg.selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.day))
      .attr('cy', d => y(d.value))
      .attr('r', 5)
      .attr('fill', 'red');
  }, []);

  return (
    <svg ref={chartRef}></svg>
  );
};

export default LineChartD3;
