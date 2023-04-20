// Load the data
d3.csv("https://raw.githubusercontent.com/Mechadecimal/DatavizS2023-GreenTeam/main/data/clean_data/clean_data.csv", function(data) {

  // Extract the unique values of the 'category' column to use as options in the dropdown menu
  var categories = d3.map(data, function(d){return d.category;}).keys();

  // Create the dropdown menu
  var dropdown = d3.select("#dropdown")
    .append("select")
    .attr("id", "category-dropdown")
    .on("change", function() { // When an option is selected, update the chart
      var selectedCategory = d3.select(this).property("value");
      updateChart(data, selectedCategory);
    });

  // Add the options to the dropdown menu
  dropdown.selectAll("option")
    .data(categories)
    .enter()
    .append("option")
    .text(function(d){ return d; })
    .attr("value", function(d){ return d; });

  // Function to update the chart based on the selected category
  function updateChart(data, category) {
    // Filter the data to only include the selected category
    var filteredData = data.filter(function(d){ return d.category === category; });

    // Update the chart here using the filteredData
    // ...
  }

  // Initialize the chart with the first category
  updateChart(data, categories[0]);
});
