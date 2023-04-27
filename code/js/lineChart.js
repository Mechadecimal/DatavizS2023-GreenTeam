// Constants setup
console.log("lineChart");
    // dimensions
    var lineChart_svgWidth  = 300;
    var lineChart_svgHeight = 200;

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
    function lineChart_updateWeather(startDate, endDate, city = 'all') {
        console.log("updating line chart (weather)");

        //filter data by range
        console.log("filtering data");
        d3.csv("/data/clean_data/cleaned_weather_data.csv")
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
                    return d.city == city;
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
                                .y(function(d) { return lineChart_y(d.humidity); }))
                            .attr("fill", "none")
                            .attr("stroke", "black")
                            .attr("stroke-width", 3)

        });
    }
    
    
    // default update call (startdate, enddate)
    lineChart_updateWeather(0, 9999999)

    

        

