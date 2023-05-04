// General setup (not data related)

// Set up the map container
var mapHeight = document.getElementById("map").clientHeight;
var mapWidth = document.getElementById("map").clientWidth;

var map_svg = d3.select("#map")
.attr("width", mapWidth)
.attr("height", mapHeight);

// Define a projection for the map
var projection = d3.geoMercator()
.scale(600)
.center([-80, 32]);
// .translate([1.5 * mapWidth,mapHeight / 2]);

// Create a path generator based on the projection
var geopath = d3.geoPath()
.projection(projection);

// LINE CHART PREDEFINES
// dimensions are defined based on the ratio to make sure of the proper visualization with different screen sizes
var weather_lineChart_svgWidth  = 0.95 * document.getElementById("weather-line-chart-container").clientWidth;
var weather_lineChart_svgHeight = document.getElementById("weather-line-chart-container").clientHeight;

var seaLevel_lineChart_svgWidth  = 0.95 * document.getElementById("sealevel-line-chart-container").clientWidth;
var seaLevel_lineChart_svgHeight = document.getElementById("sealevel-line-chart-container").clientHeight;

var seaLevel_lineChart_margin = {
    top: 0.1 * seaLevel_lineChart_svgHeight,
    right: 20,
    bottom: 0.4 * seaLevel_lineChart_svgHeight,
    left:50,
    };

var weather_lineChart_margin = {
  top: 0.1 * weather_lineChart_svgHeight,
  right: 20,
  bottom: 0.15 * weather_lineChart_svgHeight,
  left:50,
  };

var seaLevel_lineChart_width = seaLevel_lineChart_svgWidth - seaLevel_lineChart_margin.right - seaLevel_lineChart_margin.left;
var seaLevel_lineChart_height = seaLevel_lineChart_svgHeight - seaLevel_lineChart_margin.top - seaLevel_lineChart_margin.bottom;

var weather_lineChart_width = weather_lineChart_svgWidth - weather_lineChart_margin.right - weather_lineChart_margin.left;
var weather_lineChart_height = weather_lineChart_svgHeight - weather_lineChart_margin.top - weather_lineChart_margin.bottom;

var contextheight = 0.5 * seaLevel_lineChart_margin.bottom;
var contextmargin = {top: weather_lineChart_svgHeight - 0.75 * seaLevel_lineChart_margin.bottom, 
    right: seaLevel_lineChart_margin.right, 
    bottom: 20, 
    left: seaLevel_lineChart_margin.left,
    };

/**
* Initialize scales/axes and append static chart elements
*/
var xScaleFocus = d3.scaleTime()
    .range([0, seaLevel_lineChart_width]);

var xScaleContext = d3.scaleTime()
    .range([0, seaLevel_lineChart_width]);

var yScaleFocus = d3.scaleLinear()
    .range([seaLevel_lineChart_height, 0])
    .nice();

var weather_yScaleFocus = d3.scaleLinear()
  .range([weather_lineChart_height, 0])
  .nice();

var yScaleContext = d3.scaleLinear()
    .range([contextheight, 0])
    .nice();

var weather_yScaleContext = d3.scaleLinear()
    .range([contextheight, 0])
    .nice();

// Initialize axes
var xAxisFocus = d3.axisBottom(xScaleFocus).tickSizeOuter(0);
var xAxisContext = d3.axisBottom(xScaleContext).tickSizeOuter(0);
var yAxisFocus = d3.axisLeft(yScaleFocus).ticks(5);
var weather_yAxisFocus = d3.axisLeft(weather_yScaleFocus).ticks(5);

// Define size of SVG drawing area
var sealevel_svg = d3.select("#sealevel-line-chart-container")
  .append("svg")
    .attr("width", seaLevel_lineChart_width + seaLevel_lineChart_margin.left + seaLevel_lineChart_margin.right)
    .attr("height", seaLevel_lineChart_height + seaLevel_lineChart_margin.top + seaLevel_lineChart_margin.bottom);

var weather_svg = d3.select("#weather-line-chart-container")
  .append("svg")
    .attr("width", weather_lineChart_width + weather_lineChart_margin.left + weather_lineChart_margin.right)
    .attr("height", weather_lineChart_height + weather_lineChart_margin.top + weather_lineChart_margin.bottom);

var sealevel_focus = sealevel_svg
  .append('g')
    .attr("transform", `translate (${seaLevel_lineChart_margin.left}, ${seaLevel_lineChart_margin.top})`);

var weather_focus = weather_svg
  .append('g')
    .attr("transform", `translate (${weather_lineChart_margin.left}, ${weather_lineChart_margin.top})`);

sealevel_focus.append('defs').append('clipPath')
  .attr('id', 'clip')
  .append('rect')
  .attr('width', seaLevel_lineChart_width)
  .attr('height', seaLevel_lineChart_height);

weather_focus.append('defs').append('clipPath')
  .attr('id', 'clip')
  .append('rect')
  .attr('width', weather_lineChart_width)
  .attr('height', weather_lineChart_height);

var sealevel_focusLinePath = sealevel_focus.append('path')
  .attr('class', 'chart-line');

var weather_focusLinePath = weather_focus.append('path')
  .attr('class', 'chart-line');

var sealevel_xAxisFocusG = sealevel_focus.append('g')
  .attr('class', 'axis x-axis')
  .attr('transform', `translate(0,${seaLevel_lineChart_height})`);

var weather_xAxisFocusG = weather_focus.append('g')
  .attr('class', 'axis x-axis')
  .attr('transform', `translate(0,${weather_lineChart_height})`);

var sealevel_yAxisFocusG = sealevel_focus.append('g')
  .attr('class', 'axis y-axis');

var weather_yAxisFocusG = weather_focus.append('g')
  .attr('class', 'axis y-axis');

var sealevel_tooltipTrackingArea = sealevel_focus.append('rect')
        .attr('width', seaLevel_lineChart_width)
        .attr('height', seaLevel_lineChart_height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all');

var weather_tooltipTrackingArea = weather_focus.append('rect')
  .attr('width', weather_lineChart_width)
  .attr('height', weather_lineChart_height)
  .attr('fill', 'none')
  .attr('pointer-events', 'all');

// Empty tooltip group (hidden by default)
var sealevel_tooltip = sealevel_focus.append('g')
  .attr('class', 'tooltip')
  .style('display', 'none');

sealevel_tooltip.append('circle')
  .attr('r',4);

sealevel_tooltip.append('text');

var weather_tooltip = weather_focus.append('g')
  .attr('class', 'tooltip')
  .style('display', 'none');

weather_tooltip.append('circle')
  .attr('r', 4);

weather_tooltip.append('text');

// Append context group with x- and y-axes
sealevel_context = d3.select("#sealevel-line-chart-container svg").append('g')
  .attr('transform', `translate(${contextmargin.left},${contextmargin.top})`);

sealevel_contextAreaPath = sealevel_context.append('path')
  .attr('class', 'chart-area');

weather_contextAreaPath = sealevel_context.append('path')
  .attr('class', 'weather-chart-area')
  .attr("opacity", 0.5)
  .attr("fill", "none")
  .attr("stroke", "black");

sealevel_xAxisContextG = sealevel_context.append('g')
  .attr('class', 'axis x-axis')
  .attr('transform', `translate(0,${contextheight})`);

var brushG = sealevel_context.append('g')
  .attr('class', 'brush x-brush');

// X axis
var lineChart_x = d3.scaleTime()
    .range([0,seaLevel_lineChart_width]);

var lineChart_xAxis = d3.axisBottom()
    .scale(lineChart_x);

// X-label
sealevel_context
  .append("text")
  .attr("class", "axis-label")
  .attr("transform", `translate(${seaLevel_lineChart_width - contextmargin.right}, ${contextheight + contextmargin.bottom})`)
  .attr('text-anchor', 'middle')
  .attr('fill', 'black')
  .text('time span');

// Chart title
var seaLevel_title = sealevel_svg
  .append("text")
  .attr("class", "chart-title")
  .attr("transform", `translate(${seaLevel_lineChart_width/2}, ${seaLevel_lineChart_margin.top / 2})`)
  .attr('text-anchor', 'middle')
  .attr('fill', 'black');

var weather_title = weather_svg
  .append("text")
  .attr("class", "chart-title")
  .attr("transform", `translate(${weather_lineChart_width/2}, ${weather_lineChart_margin.top / 2})`)
  .attr('text-anchor', 'middle')
  .attr('fill', 'black');
  

// Y-label
sealevel_svg.append("text")
  .attr("class", "axis-label")
  .attr("transform", ` translate(0, ${seaLevel_lineChart_margin.top / 2})`)
  .attr('text-anchor', 'left')
  .attr('fill', 'black')
  .text("sea level (rlr)");

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

  // Stations
  d3.csv("/data/clean_data/clean_sea_level_data.csv")
    .then(function(stationsData) {

      var stationParseTime = d3.timeParse("%m/%d/%Y");

      // console.log(stationsData);
      stationsData.forEach(d => {
        d.month = parseInt(d.Date.split("/")[0]); // Read the month as an int
        d.year = parseInt(d.Date.split("/")[2]); // Read the yeear as an int
        d.Longitude = '-'.concat(d.Longitude); // All the longitudes are missing a "-"
        d["Sea Level"] = +d["Sea Level"];
        d.Date = stationParseTime(d.Date);
      });

      console.log(stationsData);

    // Weather data
    d3.csv("/data/clean_data/cleaned_weather_data.csv")
    .then(function(weatherData) {// Extract the city names from the city_attributes.csv data
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
          // console.log("filtering stations");
          return stationsData.filter(d => {
            // Be carefull: getMonth() is zero index => January = 0
            return d.year == year && d.month == month && d["Sea Level"] > 0;
          });
        }
        
      };
        
      // Choose a date for the default visualization
      var weatherDataSelected = updateDate(1, 1, 2015, "weather");
      var stationDataSelected = updateDate(1, 1, 2015, "stations");

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

      var city = "Los Angeles";
      
      var lineChart_filterData = weatherData.filter(d => d.location == city);

      lineChart_x.domain(d3.extent(lineChart_filterData, d => d.date));
            
      // update line
      function drawLineChart(weatherAttribute) {

        weather_focusLinePath.style("stroke", getColor(weatherAttribute));
        weather_contextAreaPath.style("stroke", getColor(weatherAttribute));
        // weather_svg.selectAll(".y-label").remove();
        function unit() {
          return weatherAttribute == "temperature" ? " (\u00b0F)":
                  weatherAttribute == "humidity"   ? " (%)":
                  weatherAttribute == "pressure"   ? " (mbar)":
                                                     " (mph)";
        }

        // remove the old label and insert the the new one
        weather_svg.selectAll(".axis-label").remove();
        weather_svg.append("text")
          .attr("class", "axis-label")
          .attr("transform", ` translate(0, ${weather_lineChart_margin.top / 2})`)
          .attr('text-anchor', 'left')
          .attr('fill', 'black')
          .text(weatherAttribute + unit());
 
        let filteredData = lineChart_filterData;
        
        weather_title.text( weatherAttribute + ' at ' + filteredData[0].location); // Update the chart title
        
        let xValue = d => d["date"];
        let yValue = d => d[weatherAttribute];

        // Initialize line and area generators
        let line = d3.line()
            .x(d => xScaleFocus(xValue(d)))
            .y(d => weather_yScaleFocus(yValue(d)));

        let area = d3.area()
            .x(d => xScaleContext(xValue(d)))
            .y1(d => weather_yScaleContext(yValue(d)))
            .y0(contextheight);

        // Set the scale input domains
        weather_yScaleFocus.domain(d3.extent(filteredData, yValue));
        weather_yScaleContext.domain(weather_yScaleFocus.domain());

        let bisectDate = d3.bisector(xValue).left;

        // renderVis();
        weather_focusLinePath
          .datum(filteredData)
          .attr('d', line);

        weather_contextAreaPath
          .datum(filteredData)
          .attr('d', area);

        weather_tooltipTrackingArea
          .on('mouseenter', () => {
            weather_tooltip.style('display', 'block');
          })
          .on('mouseleave', () => {
            weather_tooltip.style('display', 'none');
          })
          .on('mousemove', function(event) {
            // Get date that corresponds to current mouse x-coordinate
            const xPos = d3.pointer(event)[0]; // First array element is x, second is y
            const date = xScaleFocus.invert(xPos);

            // Find nearest data point
            const index = bisectDate(filteredData, date, 1);
            const a = filteredData[index - 1];
            const b = filteredData[index];
            const d = b && (date - a.date > b.date - date) ? b : a; 

            // Update tooltip
            weather_tooltip.select('circle')
                .attr('transform', `translate(${xScaleFocus(d.date)},${weather_yScaleFocus(d[weatherAttribute])})`);
            
            weather_tooltip.select('text')
                .attr('transform', `translate(${xScaleFocus(d.date)},${(weather_yScaleFocus(d[weatherAttribute])) - 8})`)
                .text(d[weatherAttribute].toFixed(2));
          });

          // Update the axes
          weather_xAxisFocusG.call(xAxisFocus);
          weather_yAxisFocusG.call(weather_yAxisFocus);
      }
     
      function drawStationsLineChart(city) {

        seaLevel_title.text('Sea Level at ' + city + ' Station');

        let brush = d3.brushX()
        .extent([[0, 0], [seaLevel_lineChart_width, contextheight]])
        .on('brush', function({selection}) {
          if (selection) brushed(selection);
        })
        .on('end', function({selection}) {
          if (!selection) brushed(null);
        });

        function brushed(selection) {    
          // Check if the brush is still active or if it has been removed
          if (selection) {
            // Convert given pixel coordinates (range: [x0,x1]) into a time period (domain: [Date, Date])
            const selectedDomain = selection.map(xScaleContext.invert, xScaleContext);
        
            // Update x-scale of the focus view accordingly
            xScaleFocus.domain(selectedDomain);
          } else {
            // Reset x-scale of the focus view (full time period)
            xScaleFocus.domain(xScaleContext.domain());
          }
        
          // Redraw line and update x-axis labels in focus view
          sealevel_focusLinePath.attr('d', line);
          sealevel_xAxisFocusG.call(xAxisFocus);
          let weatherAttribute = document.getElementById("weather-attribute-select").value;
          drawLineChart(weatherAttribute);
        }

        let filteredData = stationsData.filter(d => d.City == city && d["Sea Level"] >= 0);
        
        let xValue = d => d["Date"];
        let yValue = d => d["Sea Level"];

        // Initialize line and area generators
        let line = d3.line()
            .x(d => xScaleFocus(xValue(d)))
            .y(d => yScaleFocus(yValue(d)));

        let area = d3.area()
            .x(d => xScaleContext(xValue(d)))
            .y1(d => yScaleContext(yValue(d)))
            .y0(contextheight);

        // Set the scale input domains
        xScaleFocus.domain(d3.extent(filteredData, xValue));
        yScaleFocus.domain(d3.extent(filteredData, yValue));
        xScaleContext.domain(xScaleFocus.domain());
        yScaleContext.domain(yScaleFocus.domain());

        let bisectDate = d3.bisector(xValue).left;

        // renderVis();
        sealevel_focusLinePath
          .datum(filteredData)
          .attr('d', line);

        sealevel_contextAreaPath
          .datum(filteredData)
          .attr('d', area);

        sealevel_tooltipTrackingArea
          .on('mouseenter', () => {
            sealevel_tooltip.style('display', 'block');
          })
          .on('mouseleave', () => {
            sealevel_tooltip.style('display', 'none');
          })
          .on('mousemove', function(event) {
            // Get date that corresponds to current mouse x-coordinate
            const xPos = d3.pointer(event)[0]; // First array element is x, second is y
            const date = xScaleFocus.invert(xPos);

            // Find nearest data point
            const index = bisectDate(filteredData, date, 1);
            const a = filteredData[index - 1];
            const b = filteredData[index];
            const d = b && (date - a.Date > b.Date - date) ? b : a; 

            // Update tooltip
            sealevel_tooltip.select('circle')
                .attr('transform', `translate(${xScaleFocus(d.Date)},${yScaleFocus(d["Sea Level"])})`);
            
            sealevel_tooltip.select('text')
                .attr('transform', `translate(${xScaleFocus(d.Date)},${(yScaleFocus(d["Sea Level"])) - 8})`)
                .text(d["Sea Level"]);
          });

        // Update the axes
        sealevel_xAxisFocusG.call(xAxisFocus);
        sealevel_yAxisFocusG.call(yAxisFocus);
        sealevel_xAxisContextG.call(xAxisContext);

        // Update the brush and define a default position
        const defaultBrushSelection = [xScaleFocus(new Date('2016-01-01')), xScaleContext.range()[1]];
        brushG
          .call(brush)
          .call(brush.move, defaultBrushSelection);        
      }

      drawStationsLineChart("Corpus Christi");
      drawLineChart("humidity"); // It has to be called after drawStationsLineChart() because of the x-axis scale dependecy

      function drawStationCircles() {
        let seaLevelDomain = [d3.min(stationDataSelected, d => d["Sea Level"]), d3.max(stationDataSelected, d => d["Sea Level"])];
        let colorScale = d3.scaleLinear()
          .domain(seaLevelDomain)
          .range(["blue", "red"]);
        // console.log(seaLevelDomain);
        map_svg
          .append("g")
          .selectAll("StationsCircles")
          .data(stationDataSelected)
          .join("circle")
          .attr("class", "Stations")
          .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
          .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
          .attr("r", "4")
          .style("fill", d => colorScale(d["Sea Level"]))
          .attr("fill-opacity", 0.6)
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
          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
          })
          .on('click', (event, d) => {
            // console.log(d.City);
            drawStationsLineChart(d.City);
          });
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
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        })
        .on('click', (event, data) => {
          lineChart_filterData = weatherData.filter(d => d.location == data.location);
          d3.selectAll(".lineTest").remove();
          drawLineChart(attribute);
          
        });
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
              return grp == "Cities" ? rScale(d[weatherAttribute]) : "4";
            });

          // Otherwise I hide it
          }else{
            map_svg.selectAll("."+grp).transition().duration(1000).style("opacity", 0).attr("r", 0);
            // console.log(grp);
          }
        })
      }

      

      // --- //

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
        let weatherAttribute = document.getElementById("weather-attribute-select").value;
        // Change the scale domain
        rScale = d3.scaleLinear(weatherAttribute)
          .domain([d3.min(weatherData, d => d[weatherAttribute]), d3.max(weatherData, d => d[weatherAttribute])])   // What's in the data
          .range([2, 20])  // Size in pixel
        drawWeatherCircles(weatherAttribute);
        drawStationCircles();
        
        // Update the line chart
  
        d3.selectAll(".lineTest").remove();
        drawLineChart(weatherAttribute);
      });

      d3.selectAll("#city-select").on("change", () => {
        let selectedCity = document.getElementById("city-select").value;
        let weatherAttribute = document.getElementById("weather-attribute-select").value;
        console.log(selectedCity);
        lineChart_filterData = weatherData.filter(d => d.location == selectedCity);
        // d3.selectAll(".lineTest").remove();
        drawLineChart(weatherAttribute);
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