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

    width = lineChart_svgWidth - chartMargin.right - chartMargin.left,
    height = lineChart_svgHeight - chartMargin.top - chartMargin.bottom;


//Modify this file to the following framework; https://d3-graph-gallery.com/graph/line_change_data.html
//Status: done


//Data sets should be declared before this file


// Start of SVG

    // Create svg, add properties and nudge to top left
    var lineChart_Svg = d3.select("#line-chart-container")
        .append("svg")
            .attr("width", lineChart_margin.width + lineChart_margin.left + lineChart_margin.right)
            .attr("height", lineChart_margin.height + lineChart_margin.top + lineChart_margin.bottom)
        .append('g')
            .attr("transform", `translate (${lineChart_margin.left}, ${lineChart_margin.top})`)


    // X axis

    var lineChart_x = d3.scaleLinear().range([0,width]);
    var lineChart_xAxis = d3.axisBottom().scale(lineChart_x);
        lineChart_svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .attr("class","lineChart_Xaxis")

    // Y axis
    var lineChart_y = d3.scaleLinear().range([height, 0]);
    var lineChart_yAxis = d3.axisLeft().scale(lineChart_y);
        lineChart_svg.append("g")
            .attr("class","lineChart_Yaxis")



    // Update function; call at begining and whenever data change is necessary
    function updateStation(data, startDate, endDate) {

        // update X axis:
        lineChart_x.domain([0, d3.max(data, function(d) { return d.ser1 }) ]);
        lineChart_svg.selectAll(".lineChart_xAxis").transition()
            .duration(3000)
            .call(xAxis);
        
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
                            .x(function(d) { return x(d.ser1); })
                            .y(function(d) { return y(d.ser2); }))
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-width", 3)
        }
        
    // default update call
    updateStation("[insert data to call]", "[insert startdate]", "[insert enddate]")

    

        

