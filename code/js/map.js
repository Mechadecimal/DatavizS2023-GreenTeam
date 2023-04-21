// General setup (not data related)

// Set up the map container
var mapWidth = 600;
var mapHeight = 300;
var map_svg = d3.select("#map")
.attr("width", mapWidth)
.attr("height", mapHeight);

// Define a projection for the map
var projection = d3.geoMercator()
.scale(540)
.center([-78, 29]);
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
  d3.csv("/data/clean_data/cleaned_weather_data.csv")
  .then(function(weatherData) {

    console.log(weatherData);

    // Extract the city names from the city_attributes.csv data
    // It has to be before type conversion!
    const cityNames = weatherData.map(d => d.location).sort();
    const cityNamesSet = new Set(cityNames); // To remove the many duplicates

    const weatherAttributes = ["humidity", "temperature", "pressure", "wind_speed"];

    // Get the dropdown element and populate it with city names/weather attribute type
    populateDropdownMenu("#city-select", cityNamesSet);
    populateDropdownMenu("#weather-attribute-select", weatherAttributes);

    var parseTime = d3.timeParse("%Y-%m-%d");

    weatherData.forEach(d => {
      // Convert string to numerical values for calculations
      d.temperature = parseFloat(d.temperature);
      d.humidity    = parseFloat(d.humidity);
      d.pressure    = parseFloat(d.pressure);
      d.wind_speed  = parseFloat(d.wind_speed);
      // Convert time from string to a Date object
      d.date        = parseTime(d.date);
    });

    // This functions filters data based on the selected date
    function updateDate(day, month, year) {
      return weatherData.filter(d => {
        // Be carefull: getMonth() is zero index => January = 0
        return d.date.getFullYear() == year && (d.date.getMonth() + 1) == month && d.date.getDate() == day;
      });
    };
      
    // Choose a date for the default visualization
    var weatherDataSelected = updateDate(1, 1, 2015);

    // console.log(weatherDataSelected);

    // Add a scale for bubble size
    var rScale = d3.scaleLinear()
    .domain([d3.min(weatherData, d => d.humidity), d3.max(weatherData, d => d.humidity)])   // What's in the data
    .range([2, 15])  // Size in pixel

    function getColor(attribute) {
      return  attribute == "temperature" ? '#d7191c' :
              attribute == "humidity"    ? '#abd9e9' :
              attribute == "wind_speed"  ? '#1b9e77' :
                                           '#b2abd2' ;
    };
    
    // Add circles:
    function drawCircles(attribute) {
      map_svg
      .append("g")
      .selectAll("myCircles")
      .data(weatherDataSelected)
      .join("circle")
      .attr("class", "Cities")
      .attr("cx", d => projection([d.longitude, d.latitude])[0])
      .attr("cy", d => projection([d.longitude, d.latitude])[1])
      .attr("r", d => rScale(d[attribute]))
      .style("fill", getColor(attribute))
      .attr("fill-opacity", 0.6);
    }

    drawCircles("humidity");

    // This function is gonna change the opacity and size of selected and unselected circles
    function updateMap(){
      var weatherAttribute = document.getElementById("weather-attribute-select").value;
      // For each check box:
      d3.selectAll(".checkbox").each(function(d){
        cb = d3.select(this);
        grp = cb.property("value");

        // If the box is check, I show the group
        if(cb.property("checked")){
          map_svg.selectAll("."+grp).transition().duration(1000).style("opacity", 1).attr("r", d => rScale(d[weatherAttribute]));

        // Otherwise I hide it
        }else{
          map_svg.selectAll("."+grp).transition().duration(1000).style("opacity", 0).attr("r", 0);
        }
      })
    }

    d3.selectAll(".date").on("change",() => {
      // get a reference to the date element
      var selectedDate = document.getElementById("myDate");
      // get year, month and day as integers
      const year  = parseInt(selectedDate.value.substring(0,4));
      const month = parseInt(selectedDate.value.substring(5,7));
      const day   = parseInt(selectedDate.value.substring(8,10));
      d3.selectAll("circle").remove();
      weatherDataSelected = updateDate(day, month, year);
      var weatherAttribute = document.getElementById("weather-attribute-select").value;
      drawCircles(weatherAttribute);
    });

    // When a button change, I run the update function
    d3.selectAll(".checkbox").on("change", updateMap);

    d3.selectAll("#weather-attribute-select").on("change", () => {
      d3.selectAll("circle").remove();
      var weatherAttribute = document.getElementById("weather-attribute-select").value;
      // Change the scale domain
      rScale = d3.scaleLinear()
        .domain([d3.min(weatherData, d => d[weatherAttribute]), d3.max(weatherData, d => d[weatherAttribute])])   // What's in the data
        .range([2, 20])  // Size in pixel
      drawCircles(weatherAttribute);
    });
  
    // And I initialize it at the beginning
    // update()
  })
  .catch(function(error) {
    console.log("An error occured in weather data");
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