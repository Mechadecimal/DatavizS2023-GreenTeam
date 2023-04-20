// Load the data
d3.csv("https://raw.githubusercontent.com/Mechadecimal/DatavizS2023-GreenTeam/main/data/clean_data/clean_data.csv", function(data) {

  // Define the minimum and maximum values for the slider
  var minYear = d3.min(data, function(d) { return +d.year; });
  var maxYear = d3.max(data, function(d) { return +d.year; });

  // Set the initial values for the slider
  var startYear = minYear;
  var endYear = maxYear;

  // Create the slider
  var slider = d3.select("#slider")
    .append("input")
    .attr("type", "range")
    .attr("min", minYear)
    .attr("max", maxYear)
    .attr("value", startYear + "," + endYear)
    .attr("step", 1)
    .on("input", function() {
      var values = this.value.split(",");
      startYear = +values[0];
      endYear = +values[1];
      updateChart(data, startYear, endYear);
    });

  // Function to update the chart based on the selected range of years
  function updateChart(data, startYear, endYear) {
    // Filter the data to only include years within the selected range
    var filteredData = data.filter(function(d){ 
      return d.year >= startYear && d.year <= endYear;
    });

    // Update the chart here using the filteredData
    // ...
  }

  // Initialize the chart with the full range of years
  updateChart(data, minYear, maxYear);
});
