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
  d3.csv("/data/clean_data/city_attributes.csv")
  .then(function(city_attr) {

    // console.log(city_attr);

    // Extract the city names from the city_attributes.csv data
    // It has to be before type conversion!
    const cityNames = city_attr.map(d => d.City).sort();

    const weatherAttributes = ["temperature", "humidity", "pressure", "wind speed"];

    // Get the dropdown element and populate it with city names/weather attribute type
    populateDropdownMenu("#city-select", cityNames);
    populateDropdownMenu("#weather-attribute-select", weatherAttributes);

    // Read the humidity data
    d3.csv("data/clean_data/humidity.csv").then(function(humidity_data) {
      console.log(humidity_data);

      humidity_data.forEach(record => {
        // Convert all values to float datatype
        for (key in record) {
          record[key] = parseFloat(record[key]);
        }
        record.year = parseInt(record.year);
        record.month = parseInt(record.month);
        record.day = parseInt(record.day);
        // d.date = d.month + "-" + d.day + "-" + d.year;
      });

      // Select data for a specific date
      humidity_selected = humidity_data.filter(d => {
        return d.year == 2015 && d.month == 1 && d.day == 1;
      });

      console.log(humidity_selected[0]["Vancouver"]);

       // Add a scale for bubble size
       const size = d3.scaleLinear()
       .domain([0,100])  // What's in the data
       .range([0, 20])  // Size in pixel

       // Add circles:
      map_svg
      .append("g").style("z-index", "3")
      .selectAll("myCircles")
      .data(city_attr)
      .join("circle")
      .attr("class", "Cities")
      .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
      .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
      .attr("r", d => size(humidity_selected[0][d.City])) //humidity_selected has the required object inside an array. So, we call index 0.
      .style("fill", "black")
      // .attr("stroke", "#BF4747")
      // .attr("stroke-width", 3)
      .attr("fill-opacity", 0.6);

      // This function is gonna change the opacity and size of selected and unselected circles
      function update(){
    
        // For each check box:
        d3.selectAll(".checkbox").each(function(d){
          cb = d3.select(this);
          grp = cb.property("value");
  
          // If the box is check, I show the group
          if(cb.property("checked")){
            map_svg.selectAll("."+grp).transition().duration(1000).style("opacity", 1).attr("r", d => size(humidity_selected[0][d.City]));
  
          // Otherwise I hide it
          }else{
            map_svg.selectAll("."+grp).transition().duration(1000).style("opacity", 0).attr("r", 0);
          }
        })
      }

      // When a button change, I run the update function
      d3.selectAll(".checkbox").on("change",update);

    })
    .catch(function(error) {
      console.log("An error occured in humidity data");
      console.log(error);
    });

      

      d3.selectAll(".date").on("change",d => {
        var selectedDate = document.getElementById("myDate");
        console.log(selectedDate.value);
      });

      // d3.selectAll(".hour").on("change",d => {
      //   var selectedHour = document.getElementById("myHour");
      //   console.log(selectedHour.value);
      // });
    
      // And I initialize it at the beginning
      // update()


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