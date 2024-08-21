import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SmallLineChart = ({ data, yLabel }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove(); 

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 300 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count || d.average)])
      .nice()
      .range([height, 0]);

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y).ticks(5))
      .append('text')
      .attr('fill', '#000')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text(yLabel);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line()
        .x(d => x(d.month))
        .y(d => y(d.count || d.average))
      );

  }, [data, yLabel]); 

  return (
    <svg ref={chartRef} width="300" height="200"></svg>
  );
};

export default SmallLineChart;
