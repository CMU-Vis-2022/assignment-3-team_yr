//Pulled info from https://d3-graph-gallery.com/graph/line_basic.html
import * as d3 from "d3";
import { ConsoleLogger } from "@duckdb/duckdb-wasm";

export function lineChart() {
  const margin = { top: 30, right: 0, bottom: 30, left: 50 };
  const width = document.body.clientWidth;
  const height = 500; 

  const xRange = [margin.left, width - margin.right];
  const yRange = [height - margin.bottom, margin.top];

  // Construct scales and axes.
  const xScale = d3.scaleTime().range(xRange);
  const yScale = d3.scaleLinear().range(yRange).domain([0, 160]);

  const xAxis = d3.axisBottom(xScale).ticks(width / 80);
  const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

  // Create the SVG element for the chart.
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  // Add the x axis
  svg
    .append("g")
    .attr("class", "xaxis")
    .attr("transform", `translate(0,${height - margin.bottom})`);

  // Add the y axis
  svg
    .append("g")
    .attr("class", "yaxis")
    .attr("transform", `translate(${margin.left},0)`);


  // Add the background
  var x = 1; //need for indexing into array
  var levels = [{ "name": "Good", "min": 0, "max": 50, "color": "#9cd84e" }, 
                { "name": "Moderate", "min": 51, "max": 100, "color": "#facf39" }, 
                { "name": "Unhealthy for Sensitive Groups", "min": 101, "max": 150, "color": "#f99049" },
                { "name": "Unhealthy", "min": 151, "max": 200, "color": "#f65e5f" },
                { "name": "Very Unhealthy", "min": 201, "max": 300, "color": "#a070b6" },
                { "name": "Hazardous", "min": 301, "color": "#a06a7b" }];
  var height_level = yScale(0) - yScale(50);
  svg.append("rect")
    .attr("fill", levels[0].color)
    .attr("opacity", 0.3) 
    .attr("width", width - margin.left - margin.right)
    .attr("height", height_level)
    .attr("x", margin.left)
    .attr("y", yScale(45+ levels[0].min)); 
  
  while(x < 3) {
    svg.append("rect")
          .attr("fill", levels[x].color)
          .attr("opacity", 0.3)
          .attr("width", width - margin.left - margin.right)
          .attr("height", height_level)
          .attr("x", margin.left)
          .attr("y", yScale(45 + levels[x].min)); 
    x = x + 1;
  }
  svg.append("rect")
    .attr("fill", levels[3].color)
    .attr("opacity", 0.3)
    .attr("x", margin.left)
    .attr("y", yScale(160))
    .attr("width", width - margin.left - margin.right)
    .attr("height", yScale(0) - yScale(8));
  
  
    // Adding scatterplot
    const scatterplot = svg
        .append("g");
    
    // Add mouseover line
    const hover = svg
        .append("g")
        .append('rect')
        .attr("y", margin.top)
        .style("stroke-width", "3px") 
        .attr('width', "0.2px")
        .attr("height", height - margin.bottom - margin.top)
        .attr("stroke", "black")
        .style("opacity", 1); 
        


    //add timeline
    const timeline = svg
        .append("path")
        .attr('fill', 'none')
        .attr("opacity", 0.8)
        .attr("class", "line")
        .attr("stroke", "black")
        .attr("stroke-width", 1);
        
  // Add text for hover
  const texts = svg
    .append("text")
    .append("g")
    .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "right"); 

  // Add grey background
  const grey_area = svg
    .append("path")
        .attr("class", "grey_area")
        .attr("fill", "#696969")
        .attr("opacity", 0.5);  
  
  // Adding mouseover detector
  var m_box = svg.append("rect")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function () {
          m_line.style("opacity", 1);
          m_text.style("opacity", 1);
      })
      .on("mouseout", function () {
          m_line.style("opacity", 0);
          m_text.style("opacity", 0);
      });
  

  
        function update(X: string[], Y_aqi_low: Int32Array | Uint8Array, Y_aqi_hi: Int32Array | Uint8Array,) {
          xScale.domain([new Date(X[0]), new Date(X[X.length - 1])]);
          yScale.domain(0, 160); 
        }
      

    texts
      .selectAll("text")
      .data(I)
      .join("text")
      .attr("x", (i) => xScale(X[i]))
      .attr("y", (i) => yScale(Y[i])! + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("dx", -4)
      .text((i) => xScale.tickFormat(100, "d")(X[i])!)
      .call((text) =>
        text
          .filter((i) => xScale(X[i]) - xScale(0) < 20) // short bars
          .attr("dx", +4)
          .attr("fill", "black")
          .attr("text-anchor", "start")
      );

    // Clear the axis so that when we add the grid, we don't get duplicate lines
    svg.select(".xaxis").selectAll("*").remove();

    // Update axes since we set new domains
    svg
      .select<SVGSVGElement>(".xaxis")
      .call(xAxis)
      // add gridlines
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("y2", height - margin.top - margin.bottom)
          .attr("stroke-opacity", 0.1)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", width - margin.right)
          .attr("fill", "black")
          .attr("text-anchor", "end")
          .text("Count →")
      );

    svg.select<SVGSVGElement>(".yaxis").call(yAxis);
  }

  return {
    element: svg.node()!,
    update,
  };
}
