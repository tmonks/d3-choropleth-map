// margins and dimensions
const w = 1400;
const h = 900;
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
  .attr("fill", "black")
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

// color scheme & scale
const countyColors = d3.schemePurples[9];
countyColors.shift(); // drop the first color
colorScale = d3.scaleQuantize([0, 80], countyColors);

// legend
const legendScale = d3.scaleLinear().domain([0, 80]).range([0, legendWidth]);
const legendAxis = d3.axisBottom(legendScale).tickFormat((d) => d + "%");
const legend = graph
  .append("g")
  .attr("width", legendWidth)
  .attr("height", legendHeight)
  .attr("transform", `translate(${graphWidth / 2 - legendWidth / 2}, 0)`)
  .attr("id", "legend");
legend
  .append("g")
  .attr("id", "legend-axis")
  .attr("transform", `translate(${legendMargin.left}, ${legendHeight - legendMargin.bottom})`)
  .call(legendAxis);
// add colored blocks to legend
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
const tooltip = d3.select(".canvas").append("div").attr("id", "tooltip").style("opacity", 0);

const promises = [
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"),
];

// once both data sources have been retrieved
Promise.all(promises).then((values) => {
  const counties = topojson.feature(values[0], values[0].objects.counties);
  const educationData = values[1];
  // use geoIdentity to fit map to the container, since data is already projected
  const projection = d3.geoIdentity().fitSize([graphWidth, graphHeight], counties);
  const path = d3.geoPath().projection(projection);

  // draw counties
  graph
    .selectAll("path")
    .data(educationData)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", (d) => path(counties.features.find((x) => x.id == d.fips)))
    .attr("fill", (d) => colorScale(d.bachelorsOrHigher))
    .attr("data-fips", (d) => d.fips)
    .attr("data-education", (d) => d.bachelorsOrHigher)
    .on("mouseover", (d) => {
      // set up and show tool tip
      tooltip.transition().duration(100).style("opacity", 0.9);
      tooltip
        .html(`${d.area_name}, ${d.state}<br />${d.bachelorsOrHigher}%`)
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY + 10 + "px");
      tooltip.attr("data-education", d.bachelorsOrHigher);
    })
    .on("mouseout", (d) => {
      // hide tool tip
      tooltip.transition().duration(100).style("opacity", 0);
    });

  // state boundaries
  graph
    .append("path")
    .datum(topojson.mesh(values[0], values[0].objects.states, (a, b) => a !== b)) // the a !== b filter returns interior borders only
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("d", path);
});
