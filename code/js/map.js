// General setup (not data related)

// Set up the map container
var mapWidth = 600;
var mapHeight = 300;
var map_svg = d3.select("#map")
.attr("width", mapWidth)
.attr("height", mapHeight);

// Define a projection for the map
var projection = d3.geoMercator()
.scale(550)
.center([-78, 28]);
// .translate([1.5 * mapWidth,mapHeight / 2]);

// Create a path generator based on the projection
var geopath = d3.geoPath()
.projection(projection);

/*  NOTE: By using the following nested structure we make sure geojson polygons stay in the background 
    and cities are drawn on top of it */

// US States Map
d3.json("data/geojson/gz_2010_us_040_00_500k.geojson").then(function(geojson) {

  // Draw the map using the GeoJSON data
  map_svg.append("g")
    .selectAll("path")
    .data(geojson.features)
    .join("path")
    .attr("class", "state-polygon")
    .attr("fill", "#b8b8b8")
    .attr("d", geopath)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .style("opacity", "0.4")

  // Cities' locations
  d3.csv("/data/clean_data/city_attributes.csv")
  .then(function(data) {

    console.log(data);

    // Extract the city names from the city_attributes.csv data
    // It has to be before type conversion!
    const cityNames = data.map(d => d.City).sort();

    const weatherAttributes = ["temperature", "humidity", "pressure", "wind speed"];

    // Get the dropdown element and populate it with city names/weather attribute type
    populateDropdownMenu("#city-select", cityNames);
    populateDropdownMenu("#weather-attribute-select", weatherAttributes);

    // Add circles:
    map_svg
      .append("g").style("z-index", "3")
      .selectAll("myCircles")
      .data(data)
      .join("circle")
      .attr("class", "Cities")
      .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
      .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
      .attr("r", d => "4")
      .style("fill", "black")
      // .attr("stroke", "#BF4747")
      // .attr("stroke-width", 3)
      .attr("fill-opacity", 1);

      // This function is gonna change the opacity and size of selected and unselected circles
      function update(){
    
        // For each check box:
        d3.selectAll(".checkbox").each(function(d){
          cb = d3.select(this);
          grp = cb.property("value");
  
          // If the box is check, I show the group
          if(cb.property("checked")){
            map_svg.selectAll("."+grp).transition().duration(1000).style("opacity", 1).attr("r", "4");
  
          // Otherwise I hide it
          }else{
            map_svg.selectAll("."+grp).transition().duration(1000).style("opacity", 0).attr("r", 0);
          }
        })
      }

      // When a button change, I run the update function
      d3.selectAll(".checkbox").on("change",update);
    
      // And I initialize it at the beginning
      update()


  })
  .catch(function(error) {
    console.log("An error occured in city data");
    console.log(error);
  });

})
.catch(function(error) {
  console.log("An error occured in geo data");
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
