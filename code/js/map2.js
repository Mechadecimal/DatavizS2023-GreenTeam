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
    .style("opacity", "0.4");
    


  // Stations
  d3.csv("../code/data/clean_data/clean_sea_level_data.csv")
    .then(function(stationsData) {
      // console.log(stationsData);
      stationsData.forEach(d => {
        d.month = parseInt(d.Date.split("/")[0]); // Read the month as an int
        d.year = parseInt(d.Date.split("/")[2]); // Read the yeear as an int
        d.Longitude = '-'.concat(d.Longitude); // All the longitudes are missing a "-"
        d["Sea Level"] = +d["Sea Level"];
      });

    // Weather data
    d3.csv("../code/data/clean_data/cleaned_weather_data.csv")
    .then(function(weatherData) {

      // console.log(weatherData);

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
        d.temperature = (parseFloat(d.temperature) - 273.15) * 9 / 5 + 32; // K to f conversion
        d.humidity    = parseFloat(d.humidity);
        d.pressure    = parseFloat(d.pressure);
        d.wind_speed  = parseFloat(d.wind_speed) /  1.609344; // km/hr to mph conversion
        // Convert time from string to a Date object
        d.date        = parseTime(d.date);
      });

      // This functions filters data based on the selected date
      function updateDate(day, month, year, data) {
        if(data == "weather") {
          return weatherData.filter(d => {
            // Be carefull: getMonth() is zero index => January = 0
            return d.date.getFullYear() == year && (d.date.getMonth() + 1) == month && d.date.getDate() == day;
          });
        } else if (data == "stations") { // Stations data are monthly
          console.log("filtering stations");
          return stationsData.filter(d => {
            // Be carefull: getMonth() is zero index => January = 0
            return d.year == year && d.month == month && d["Sea Level"] > 0;
          });
        }
        
      };
        
      // Choose a date for the default visualization
      var weatherDataSelected = updateDate(1, 1, 2015, "weather");
      var stationDataSelected = updateDate(1, 1, 2015, "stations");

      console.log(stationDataSelected);

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

      function drawStationCircles() {
        let seaLevelDomain = [d3.min(stationDataSelected, d => d["Sea Level"]), d3.max(stationDataSelected, d => d["Sea Level"])];
        let colorScale = d3.scaleLinear()
          .domain(seaLevelDomain)
          .range(["blue", "red"]);
        console.log(seaLevelDomain);
        map_svg
          .append("g")
          .selectAll("StationsCircles")
          .data(stationDataSelected)
          .join("circle")
          .attr("class", "Stations")
          .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
          .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
          .attr("r", "3")
          .style("fill", d => colorScale(d["Sea Level"]))
          .attr("fill-opacity", 0.9)
          // Tooltip event listeners
          .on('mouseover', (event,d) => {
            d3.select('#tooltip')
              .style('display', 'block')
              .style('left', (event.pageX) + 'px')   
              .style('top', (event.pageY) + 'px')
              .html(`
                <div class="tooltip-title">${d.City}</div>
                <div><i>Sea level measurement station</i></div>
                <ul>
                  <li>ID: ${d.Station}</li>
                  <li>longitude: ${parseFloat(d.Longitude).toFixed(4)}\u00B0</li>
                  <li>latitude: ${parseFloat(d.Latitude).toFixed(4)}\u00B0</li>
                  <li class="selected-li">sea level: ${d["Sea Level"]}</li>
                </ul>
              `);
              //lineChart_updateWeather(0, 9999999, d.City)


          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
          });;
      }

      // Add circles:
      function drawWeatherCircles(attribute) {

        function classFinder(attr) {
          return attribute == attr ? 'selected-li' : 'unselected-li'
        }

        map_svg
        .append("g")
        .selectAll("CityCircles")
        .data(weatherDataSelected)
        .join("circle")
        .attr("class", "Cities")
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("r", d => rScale(d[attribute]))
        .style("fill", getColor(attribute))
        .attr("fill-opacity", 0.6)
        // Tooltip event listeners
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX) + 'px')   
            .style('top', (event.pageY) + 'px')
            .html(`
              <div class="tooltip-title">${d.location}</div>
              <div><i>Weather attributes</i></div>
              <ul>
                <li class=${classFinder('temperature')}>temperature: ${d.temperature.toFixed(0)} \u00B0F</li>
                <li class=${classFinder('humidity')}>humidity: ${d.humidity.toFixed(0)}%</li>
                <li class=${classFinder('pressure')}>pressure: ${d.pressure.toFixed(1)} mbar</li>
                <li class=${classFinder('wind_speed')}>wind speed: ${d.wind_speed.toFixed(1)} mph</li>
              </ul>
            `);
            lineChart_updateWeather(0, 9999999, d.location, document.getElementById("weather-attribute-select").value);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });;
      }

      drawWeatherCircles("humidity");
      drawStationCircles();

      // This function is gonna change the opacity and size of selected and unselected circles
      function updateMap(){
        var weatherAttribute = document.getElementById("weather-attribute-select").value;
        // For each check box:
        d3.selectAll(".checkbox").each(function(d){
          cb = d3.select(this);
          grp = cb.property("value");

          // If the box is check, I show the group
          if(cb.property("checked")){
            map_svg.selectAll("."+grp).transition().duration(1000).style("opacity", 1).attr("r", d => {
              return grp == "Cities" ? rScale(d[weatherAttribute]) : "3";
            });

          // Otherwise I hide it
          }else{
            map_svg.selectAll("."+grp).transition().duration(1000).style("opacity", 0).attr("r", 0);
            // console.log(grp);
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

        // Clear the map
        d3.selectAll("circle").remove();

        // Update the data selections
        weatherDataSelected = updateDate(day, month, year, "weather");
        stationDataSelected = updateDate(day, month, year, "stations");

        // Draw the updated values
        var weatherAttribute = document.getElementById("weather-attribute-select").value;
        drawWeatherCircles(weatherAttribute);
        drawStationCircles();
      });

      // When a button change, I run the update function
      d3.selectAll(".checkbox").on("change", updateMap);

      d3.selectAll("#weather-attribute-select").on("change", () => {
        d3.selectAll("circle").remove();
        var weatherAttribute = document.getElementById("weather-attribute-select").value;
        // Change the scale domain
        rScale = d3.scaleLinear(weatherAttribute)
          .domain([d3.min(weatherData, d => d[weatherAttribute]), d3.max(weatherData, d => d[weatherAttribute])])   // What's in the data
          .range([2, 20])  // Size in pixel
        drawWeatherCircles(weatherAttribute);
        drawStationCircles();
        lineChart_updateWeather(0, 9999999, 'all', weatherAttribute)
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
    console.log("An error occured in stations data");
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

///////////// SLIDER /////////////////


// // Set up margin and dimensions for the SVG
// const margin = { top: 50, right: 50, bottom: 100, left: 50 };
// const width = 600 - margin.left - margin.right;
// const height = 400 - margin.top - margin.bottom;

// // Append the SVG to the body of the webpage
// const svg = d3.select("body")
//   .append("svg")
//   .attr("width", width + margin.left + margin.right)
//   .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//   .attr("transform", `translate(${margin.left}, ${margin.top})`);

// d3.csv("wind_speed.csv").then(function(data) {
//   // Convert the year and wind_speed columns to numbers
//   data.forEach(function(d) {
//     d.year = +d.year;
//     d.wind_speed = +d.wind_speed;
//   });

//   // Set up the scale for the x-axis (year)
//   const xScale = d3.scaleLinear()
//     .domain(d3.extent(data, d => d.year))
//     .range([0, width]);

//   // Set up the slider
//   const slider = svg.append("g")
//     .attr("class", "slider")
//     .attr("transform", `translate(0, ${height / 2})`);

//   // Append the track for the slider
//   slider.append("line")
//     .attr("class", "track")
//     .attr("x1", xScale.range()[0])
//     .attr("x2", xScale.range()[1])
//     .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
//     .attr("class", "track-inset")
//     .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
//     .attr("class", "track-overlay")
//     .call(d3.drag()
//       .on("start.interrupt", function() { slider.interrupt(); })
//       .on("start drag", function() {
//         // Get the current year based on the position of the slider
//         const year = Math.round(xScale.invert(d3.event.x));
//         update(year);

//         // Update the position and label of the slider handle
//         handle.attr("cx", xScale(year));
//         label.attr("x", xScale(year))
//           .text(year);
//       }));

//   // Append the slider handle
//   const handle = slider.insert("circle", ".track-overlay")
//     .attr("class", "handle")
//     .attr("r", 9);

//   // Append the label for the slider handle
//   const label = slider.append("text")
//     .attr("class", "label")
//     .attr("text-anchor", "middle")
//     .attr("y", -25)
//     .attr("dy", ".35em");

//   // Set the initial year to be displayed on the slider
//   const initialYear = 1981;
//   update(initialYear);
//   handle.attr("cx", xScale(initialYear));
//   label.attr("x", xScale(initialYear))
//     .text(initialYear);

//   // Function to update the line chart based on the selected year
//   function update(selectedYear) {
//     // Filter the data to only include the selected year
//     const filteredData = data.filter(d => d.year === selectedYear);

//     // Update the slider label
//     label.text(selectedYear);
//   }
// });

////////// LINE CHART ////////////

// Constants setup
console.log("lineChart");
    // dimensions
    var lineChart_svgWidth  = 600;
    var lineChart_svgHeight = 400;

    var lineChart_margin = {
        top: 30,
        right: 20,
        bottom: 100,
        left:30
        };

var lineChart_width = lineChart_svgWidth - lineChart_margin.right - lineChart_margin.left;
var lineChart_height = lineChart_svgHeight - lineChart_margin.top - lineChart_margin.bottom;


//Modify this file to the following framework; https://d3-graph-gallery.com/graph/line_change_data.html
//Status: done


//Data sets should be declared before this file


// Start of SVG

    // Create svg, add properties and nudge to top left
    var lineChart_svg = d3.select("#line-chart-container")
        .append("svg")
            .attr("width", lineChart_width + lineChart_margin.left + lineChart_margin.right)
            .attr("height", lineChart_height + lineChart_margin.top + lineChart_margin.bottom)
        .append('g')
            .attr("transform", `translate (${lineChart_margin.left}, ${lineChart_margin.top})`)


    // X axis

    var lineChart_x = d3.scaleTime()
        .range([0,lineChart_width]);
    var lineChart_xAxis = d3.axisBottom()
        .scale(lineChart_x);
        lineChart_svg.append("g")
          .attr("transform", "translate(0," + lineChart_height + ")")
          .attr("class","lineChart_xAxis")

    // Y axis
    var lineChart_y = d3.scaleLinear().range([lineChart_height, 0]);
    var lineChart_yAxis = d3.axisLeft().scale(lineChart_y);
        lineChart_svg.append("g")
            .attr("class","lineChart_yAxis")

    function lineChart_updateDate(day, month, year) {
        return weatherData.filter(d => {
            // Be carefull: getMonth() is zero index => January = 0
            return d.date.getFullYear() == year && (d.date.getMonth() + 1) == month && d.date.getDate() == day;
        });
    };
    var parseTime = d3.timeParse("%Y-%m-%d");

    

    // Update function for station data; call at begining and whenever data change is necessary
    function lineChart_updateStation(startDate, endDate) {

        d3.csv("/data/clean_data/cleaned_sea_level_data.csv")
        .then(function(lineChart_filterData) {

        //filter data by daterange
        lineChart_seaData = lineChart_filterData.filter(function(d) {
        return endDate > d.date > startDate;
        })

        //parse data variables


        // update X axis:
        lineChart_x.domain([startDate, endDate]);
        lineChart_svg.selectAll(".lineChart_xAxis")
            .transition()
                .duration(3000)
                .call(lineChart_xAxis);
        
        // update Y axis
        lineChart_y.domain([0, d3.max(lineChart_seaData, function(d) { return d.SeaLevel  }) ]);
        lineChart_svg.selectAll(".lineChart_yAxis")
            .transition()
                .duration(3000)
                .call(lineChart_yAxis);
        
        // update svg
        var lineChart_update = lineChart_svg.selectAll(".lineTest")
            .data([lineChart_weatherData], function(d){ return d.date });
        
        // update line
        lineChart_update
            .enter()
                .append("path")
                    .attr("class","lineTest")
                .merge(lineChart_update)
                .transition()
                    .duration(3000)
                        .attr("d", d3.line()
                            .x(function(d) { return lineChart_x(d.date); })
                            .y(function(d) { return lineChart_y(d.SeaLevel); }))
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-width", 3)
        });
    }

    //update function for weather data
    //Todo: add multiple lines
    function lineChart_updateWeather(startDate, endDate, city = 'all', weatherAttribute) {
        console.log("updating line chart (weather)");

        //filter data by range
        console.log("filtering data");
        d3.csv("../code/data/clean_data/cleaned_weather_data.csv")
        .then(function(lineChart_filterData) {

            lineChart_filterData.forEach(d => {
                // Convert string to numerical values for calculations
                d.temperature = parseFloat(d.temperature);
                d.humidity    = parseFloat(d.humidity);
                d.pressure    = parseFloat(d.pressure);
                d.wind_speed  = parseFloat(d.wind_speed);
                // Convert time from string to a Date object
                d.date        = parseTime(d.date);
            });

            console.log("unflitered data:");



            //filter days; NEEDS TO BE TWEAKED

            lineChart_filterData = lineChart_filterData.filter(function(d) {
                console.log(d.date > startDate);
                return d.date > startDate;
            });

            console.log("dates filtered");



            //filter cities; NEEDS TO BE TWEAKED

            lineChart_filterData = lineChart_filterData.filter(function(d) {
                if(city == 'all') {
                    return true;
                }
                else {
                    return d.location == city;
                }
            });


            console.log("cities filtered");

            console.log(lineChart_filterData);

            // update X axis:
            lineChart_x.domain(d3.extent(lineChart_filterData, d => d.date));
            lineChart_svg.selectAll(".lineChart_xAxis")
                .transition()
                    .duration(3000)
                    .call(lineChart_xAxis);
            
            // update Y axis
            lineChart_y.domain([0, d3.max(lineChart_filterData, function(d) { return d.humidity  }) ]);
            lineChart_svg.selectAll(".lineChart_yAxis")
                .transition()
                    .duration(3000)
                    .call(lineChart_yAxis);
            
            // update svg
            var lineChart_update = lineChart_svg.selectAll(".lineTest")
                .data([lineChart_filterData], function(d){ return d.date });
            
            // update line
            lineChart_update
                .enter()
                    .append("path")
                        .attr("class","lineTest")
                    .merge(lineChart_update)
                    .transition()
                        .duration(3000)
                            .attr("d", d3.line()
                                .x(function(d) { return lineChart_x(d.date); })
                                .y(function(d) { return lineChart_y(
                                  weatherAttribute == "humidity" ? d.humidity : weatherAttribute == "temperature" ? d.temperature : weatherAttribute == 'pressure' ? d.pressure : d.wind_speed) }))
                            .attr("fill", "none")
                            .attr("stroke", "black")
                            .attr("stroke-width", 3)

        });
    }
    
    
    // default update call (startdate, enddate)
    lineChart_updateWeather(0, 9999999)