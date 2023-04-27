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

    // Update function for station data; call at begining and whenever data change is necessary
    function lineChart_updateStation(startDate, endDate) {

        var lineChart_seaData = "/data/clean_data/";
        var parseTime = d3.timeParse("%Y-%m-%d");

        //filter data by daterange

        

        // update X axis:
        lineChart_x.domain([0, d3.max(lineChart_seaData, function(d) { return d.ser1 }) ]);
        lineChart_svg.selectAll(".lineChart_xAxis")
            .transition()
                .duration(3000)
                .call(lineChart_xAxis);
        
        // update Y axis
        lineChart_y.domain([0, d3.max(data, function(d) { return d.ser2  }) ]);
        lineChart_svg.selectAll(".lineChart_yAxis")
            .transition()
                .duration(3000)
                .call(lineChart_yAxis);
        
        // update svg
        var lineChart_update = lineChart_svg.selectAll(".lineTest")
            .data([data], function(d){ return d.ser1 });
        
        // update line
        lineChart_update
            .enter()
                .append("path")
                    .attr("class","lineTest")
                .merge(lineChart_update)
                .transition()
                    .duration(3000)
                        .attr("d", d3.line()
                            .x(function(d) { return lineChart_x(d.ser1); })
                            .y(function(d) { return lineChart_y(d.ser2); }))
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-width", 3)
    }

    function lineChart_updateWeather(startDate, endDate) {

        var lineChart_weatherData = "/data/clean_data/cleaned_weather_data.csv";

        //filter data by daterange

        // update X axis:
        lineChart_x.domain([startDate, endDate]);
        lineChart_svg.selectAll(".lineChart_xAxis")
            .transition()
                .duration(3000)
                .call(lineChart_xAxis);
        
        // update Y axis
        lineChart_y.domain([0, d3.max(data, function(d) { return d.ser2  }) ]);
        lineChart_svg.selectAll(".lineChart_yAxis")
            .transition()
                .duration(3000)
                .call(lineChart_yAxis);
        
        // update svg
        var lineChart_update = lineChart_svg.selectAll(".lineTest")
            .data([data], function(d){ return d.ser1 });
        
        // update line
        lineChart_update
            .enter()
                .append("path")
                    .attr("class","lineTest")
                .merge(lineChart_update)
                .transition()
                    .duration(3000)
                        .attr("d", d3.line()
                            .x(function(d) { return lineChart_x(d.ser1); })
                            .y(function(d) { return lineChart_y(d.ser2); }))
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-width", 3)
    }
    
        
    // default update call (startdate, enddate)
    lineChart_update("", "")

    

        

