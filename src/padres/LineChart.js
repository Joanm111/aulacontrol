import './grafica.css';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

const LineChart = ({ endpoint, type, selectedStudentId }) => {
  const svgRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedStudentId) return;

      try {
        const response = await axios.get(endpoint);
        const data = response.data;

        console.log(`Datos obtenidos para la gráfica (${type}):`, data);

        let processedData = [];
        if (type === 'ausencias') {
          processedData = processAusenciasData(data, selectedStudentId);
        } else if (type === 'examenes') {
          processedData = processExamenesData(data, selectedStudentId);
        }

        renderChart(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [endpoint, type, selectedStudentId]);

  const processAusenciasData = (data, selectedStudentId) => {
    const filteredData = data.filter(d => d.estudianteId === selectedStudentId && d.descripcion === 'Ausente');
    const groupedData = d3.rollups(
      filteredData,
      v => v.length,
      d => d.fecha.slice(0, 7) 
    )
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)); 

    console.log(`Datos filtrados y agrupados para la gráfica de ausencias:`, groupedData);

    return groupedData;
  };

  const processExamenesData = (data, selectedStudentId) => {
    const filteredData = data.filter(d => d.estudianteId === selectedStudentId);

    const averages = {
      valor1: d3.mean(filteredData, d => d.valor1),
      valor2: d3.mean(filteredData, d => d.valor2),
      valor3: d3.mean(filteredData, d => d.valor3),
    };

    return [
      { name: 'Exam 1', value: averages.valor1 },
      { name: 'Exam 2', value: averages.valor2 },
      { name: 'Exam 3', value: averages.valor3 },
    ];
  };

  const renderChart = (data) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (type === 'ausencias') {
      renderAusenciasBarChart(svg, data);
    } else if (type === 'examenes') {
      renderBarChart(svg, data);
    }
  };

  const renderAusenciasBarChart = (svg, data) => {
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, 10])
      .range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => {
        const [year, month] = d.split("-");
        return d3.timeFormat('%b')(new Date(year, month - 1, 1)); 
      }));

    g.append('g')
      .call(d3.axisLeft(y).ticks(10));

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.date))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", "red");
  };

  const renderBarChart = (svg, data) => {
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .call(d3.axisLeft(y));

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", "lightblue"); 
  };

  return (
    <div className="svg-container">
      <svg ref={svgRef} width={300} height={200}>
        <text x="50%" y="50%" textAnchor="middle" fill="grey">
          Cargando gráfica...
        </text>
      </svg>
    </div>
  );
};

export default LineChart;
