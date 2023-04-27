// Constants setup

    // dimensions
    var lineChart_svgWidth  = 800;
    var lineChart_svgHeight = 600;

    var lineChart_margin = {
        top: 30,
        right: 20,
        bottom: 100,
        left:30
        },

    width = lineChart_svgWidth - lineChart_margin.right - lineChart_margin.left,
    height = lineChart_svgHeight - lineChart_margin.top - lineChart_margin.bottom;


//Modify this file to the following framework; https://d3-graph-gallery.com/graph/line_change_data.html
//Status: done


//Data sets should be declared before this file


// Start of SVG

    // Create svg, add properties and nudge to top left
    var lineChart_svg = d3.select("#line-chart-container")
        .append("svg")
            .attr("width", lineChart_margin.width + lineChart_margin.left + lineChart_margin.right)
            .attr("height", lineChart_margin.height + lineChart_margin.top + lineChart_margin.bottom)
        .append('g')
            .attr("transform", `translate (${lineChart_margin.left}, ${lineChart_margin.top})`)


    // X axis

    var lineChart_x = d3.scaleLinear().range([0,lineChart_margin.width]);
    var lineChart_xAxis = d3.axisBottom().scale(lineChart_x);
        lineChart_svg.append("g")
          .attr("transform", "translate(0," + lineChart_margin.height + ")")
          .attr("class","lineChart_Xaxis")

    // Y axis
    var lineChart_y = d3.scaleLinear().range([lineChart_margin.height, 0]);
    var lineChart_yAxis = d3.axisLeft().scale(lineChart_y);
        lineChart_svg.append("g")
            .attr("class","lineChart_Yaxis")

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

        var lineChart_weatherData;
        //filter data by range
        d3.csv("/data/clean_data/cleaned_weather_data.csv")
        .then(function(lineChart_filterData) {

            lineChart_weatherData = lineChart_filterData.filter(function(d) {
                return endDate > d.date > startDate;
            });

            lineChart_weatherData = lineChart_weatherData.filter(function(d) {
                if(city == 'all') {
                    return true;
                }
                else {
                    return d.city == city;
                }
            });

            //(from /map.js)
            //parse data variables
            lineChart_weatherData.forEach(d => {
                // Convert string to numerical values for calculations
                d.temperature = parseFloat(d.temperature);
                d.humidity    = parseFloat(d.humidity);
                d.pressure    = parseFloat(d.pressure);
                d.wind_speed  = parseFloat(d.wind_speed);
                // Convert time from string to a Date object
                d.date        = parseTime(d.date);
            });

            // update X axis:
            lineChart_x.domain([startDate, endDate]);
            lineChart_svg.selectAll(".lineChart_xAxis")
                .transition()
                    .duration(3000)
                    .call(lineChart_xAxis);
            
            // update Y axis
            lineChart_y.domain([0, d3.max(lineChart_weatherData, function(d) { return d.humidity  }) ]);
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
                                .y(function(d) { return lineChart_y(d.humidity); }))
                            .attr("fill", "none")
                            .attr("stroke", "black")
                            .attr("stroke-width", 3)

        });
    }
    
        
    // default update call (startdate, enddate)
    lineChart_updateWeather(0, 5)

    

        

