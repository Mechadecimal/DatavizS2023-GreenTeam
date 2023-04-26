// Set up margin and dimensions for the SVG
const margin = { top: 50, right: 50, bottom: 100, left: 50 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Append the SVG to the body of the webpage
const svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("pressure.csv").then(function(data) {
  // Convert the year and pressure columns to numbers
  data.forEach(function(d) {
    d.year = +d.year;
    d.pressure = +d.pressure;
  });

  // Set up the scale for the x-axis (year)
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, width]);

  // Set up the slider
  const slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", `translate(0, ${height / 2})`);

  // Append the track for the slider
  slider.append("line")
    .attr("class", "track")
    .attr("x1", xScale.range()[0])
    .attr("x2", xScale.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
      .on("start.interrupt", function() { slider.interrupt(); })
      .on("start drag", function() {
        // Get the current year based on the position of the slider
        const year = Math.round(xScale.invert(d3.event.x));
        update(year);

        // Update the position and label of the slider handle
        handle.attr("cx", xScale(year));
        label.attr("x", xScale(year))
          .text(year);
      }));

  // Append the slider handle
  const handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

  // Append the label for the slider handle
  const label = slider.append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("y", -25)
    .attr("dy", ".35em");

  // Set the initial year to be displayed on the slider
  const initialYear = 1981;
  update(initialYear);
  handle.attr("cx", xScale(initialYear));
  label.attr("x", xScale(initialYear))
    .text(initialYear);

  // Function to update the line chart based on the selected year
  function update(selectedYear) {
    // Filter the data to only include the selected year
    const filteredData = data.filter(d => d.year === selectedYear);

    // Update the slider label
    label.text(selectedYear);
  }
});
