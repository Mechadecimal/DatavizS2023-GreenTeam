d3.csv("/data/clean_data/city_attributes.csv")
  .then(function(data) {

    console.log(data);

    // Extract the city names from the city_attributes.csv data
    // It has to be before type conversion!
    const cityNames = data.map(d => d.City).sort();
    console.log(cityNames);

    const weatherAttributes = ["temperature", "humidity", "pressure", "wind speed"];

    // Get the dropdown element and populate it with city names/weather attribute type
    populateDropdownMenu("#city-select", cityNames);
    populateDropdownMenu("#weather-attribute-select", weatherAttributes);

    // Convert numerical values to Number datatype
    data = data.forEach(d => {
      d.Latitude = +d.Latitude;
      d.Longitude = +d.Longitude;
    });

    

  })
  .catch(function(error) {
    console.log(error);
  });

// Function to populate a dropdown menu
// id: id (string) of the dropdown menu in the index.html file
// entries: an array of names for each entry in the menu
function populateDropdownMenu(id, entries) {
  d3.select(id)
    .selectAll("option")
    .data(entries)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);
}




// var svgWidth  = 800;
// var svgHeight = 600;
// //note it is convention to do this clockwise

// var chartMargin = {
//   top: 60,
//   right: 60,
//   bottom: 60,
//   left:100
// };

// //set the chart width by subtracting the right and left values of chartMargin from svgWidth
// var chartWidth  = svgWidth - chartMargin.right - chartMargin.left;
// //set the chart width by subtracting the top and bottom values of chartMargin from svgHeight
// var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// //create and append a new svg  - set width and height attributes to svgWidth and svgHeight
// var svg = d3.select("body")
//           .append("svg")
//           .attr("height", svgHeight)
//           .attr("width" , svgWidth);

// //create a chartGroup and nudge it to the top left
// var chartGroup = svg.append("g")
//                     .attr("transform", `translate (${chartMargin.left}, ${chartMargin.top})`)


// //parse the date - note the format is YYYY-MM-DD
// var parseDate = d3.timeParse("%Y-%m-%d");

// //set up our scale
// var x = d3.scaleTime()
// .range([0, chartWidth]);

// var y = d3.scaleLinear()
// .range([chartHeight, 0]);

// //set up our Axes
// var xAxis = d3.axisBottom()
// .scale(x)

// var yAxis = d3.axisLeft()
// .scale(y)

// var line = d3.line()
// .x(function(d) { return x(d.date); })
// .y(function(d) { return y(d.deaths); });


// d3.csv("../UNRATE.csv").then(data => {
// // CHECK your DATA
// console.log("Hello", data);
// //everything is a string - parse your date and set rate to a numeric value
// data.forEach(function(d) {
// d.date = parseDate(d.DATE);
// d.rate = +d.UNRATE;
// });

// x.domain(d3.extent(data, function(d) { return d.date; }));
// y.domain(d3.extent(data, function(d) { return d.rate; }));

// chartGroup.append("g")
//   .attr("class", "x axis")
//   .attr("transform", "translate(0," + chartHeight + ")")
//   .call(xAxis);

//   chartGroup.append("text")
//   .attr("class", "x label")
//   .attr("text-anchor", "end")
//   .attr("x", chartWidth)
//   .attr("y", chartHeight - 6)
//   .text("Year");

// chartGroup.append("g")
//   .attr("class", "y axis")
//   .call(yAxis);


// //BEGIN ADD CODE HERE
// // ADD CODE BELOW THIS LINE
// var path = chartGroup.append("path")
//   .datum(data)
//   .attr("class", "line")
//   .attr("d", line)
//   .style("stroke", "white")

// var totalLength = path.node().getTotalLength();

// d3.select("#startLine").on("click", function() {
//   path
//     .attr("stroke-dasharray", totalLength + " " + totalLength)
//     .attr("stroke-dashoffset", totalLength)
//     .transition()
//       .duration(4000)
//       .ease(d3.easeLinear)
//       .attr("stroke-dashoffset", 0)
//       .style("stroke", "steelblue")
// })



// //DO NOT ADD CODE BELOW THIS LINE

// });
