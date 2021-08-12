// margins and dimensions
const w = 1400;
const h = 1000;
const legendWidth = 300;
const legendHeight = 20;
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

// create legend area
// const legend = svg.append("g").attr("width", legendWidth).attr("height", legendHeight).attr("id", "legend");

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

color = d3.scaleQuantize([0, 100], d3.schemeBlues[9]);

const promises = [
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"),
];

Promise.all(promises).then((values) => {
  console.log(values);
  const counties = topojson.feature(values[0], values[0].objects.counties);
  const states = topojson.feature(values[0], values[0].objects.states);
  const data = values[1];
  console.log("counties: ", counties);
  console.log("states: ", states);

  const projection = d3.geoIdentity().fitSize([graphWidth, graphHeight], counties);
  const path = d3.geoPath().projection(projection);

  graph
    .selectAll("path")
    .data(counties.features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", path)
    .attr("fill", (d) => color(data.find((x) => d.id == x.fips).bachelorsOrHigher))
    .attr("stroke", "white");
});
