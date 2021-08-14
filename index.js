// margins and dimensions
const w = 1400;
const h = 1000;
const legendWidth = 300;
const legendHeight = 40;
const legendMargin = { top: 0, right: 0, bottom: 20, left: 0 };
const margin = { top: 100, right: 50, bottom: 50, left: 50 };
const graphWidth = w - margin.left - margin.right;
const graphHeight = h - margin.top - margin.bottom;

// main svg
const svg = d3.select(".canvas").append("svg").attr("width", w).attr("height", h);

// create graph area
const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left}, ${margin.top})`); // move it by margin sizes

// add title
svg
  .append("text")
  .attr("id", "title")
  .attr("x", w / 2)
  .attr("y", 30)
  .text("U.S. Educational Attainment");

// add description
svg
  .append("text")
  .attr("id", "description")
  .attr("x", w / 2)
  .attr("y", 60)
  .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");

const countyColors = d3.schemeBlues[9];
colorScale = d3.scaleQuantize([0, 100], countyColors);

// legend
const legendScale = d3.scaleLinear().domain([0, 100]).range([0, legendWidth]);
const legendAxis = d3.axisBottom(legendScale);
const legend = svg
  .append("g")
  .attr("width", legendWidth)
  .attr("height", legendHeight)
  .attr("transform", `translate(0, ${h - legendHeight})`)
  .attr("id", "legend");
legend
  .append("g")
  .attr("id", "legend-axis")
  .attr("transform", `translate(${legendMargin.left}, ${legendHeight - legendMargin.bottom})`)
  .call(legendAxis);
legend
  .selectAll("rect")
  .data(countyColors)
  .enter()
  .append("rect")
  .attr("width", legendWidth / countyColors.length) // divided up into equal sized rects for each color in the scale
  .attr("height", legendHeight - legendMargin.bottom - legendMargin.top)
  .attr("x", (d, i) => (legendWidth / countyColors.length) * i)
  .attr("fill", (d) => d);

// tool tip div (hidden by default)
const tooltip = d3.select(".canvas")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

const promises = [
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"),
];

Promise.all(promises).then((values) => {
  console.log(values);
  const counties = topojson.feature(values[0], values[0].objects.counties);
  const states = topojson.feature(values[0], values[0].objects.states);
  const educationData = values[1];
  console.log("counties: ", counties);
  // console.log("states: ", states);
  const minPercent = d3.min(educationData, d => d.bachelorsOrHigher);
  const maxPercent = d3.max(educationData, d => d.bachelorsOrHigher);
  console.log(`range: ${minPercent} - ${maxPercent}`);
  const projection = d3.geoIdentity().fitSize([graphWidth, graphHeight], counties);
  const path = d3.geoPath().projection(projection);

  graph
    .selectAll("path")
    .data(educationData)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", (d) => path(counties.features.find((x) => x.id == d.fips)))
    .attr("fill", (d) => colorScale(d.bachelorsOrHigher))
    // .attr("stroke", "white")
    .attr("data-fips", (d) => d.fips)
    .attr("data-education", (d) => d.bachelorsOrHigher)
    .on("mouseover", d => {
      tooltip.transition().duration(100).style("opacity", 0.9);
      tooltip
        .html(`${d.area_name}, ${d.state}: ${d.bachelorsOrHigher}%`)
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY + 10 + "px")
      tooltip
        .attr("data-education", d.bachelorsOrHigher)
    })
    .on("mouseout", d => {
      tooltip.transition().duration(100).style("opacity", 0);
    });
});
