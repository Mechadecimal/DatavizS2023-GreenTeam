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


// Start of SVG

    // Create svg
    const lineChart_Svg = d3.select("#line-chart-container")
        .append("svg")
        .attr("width", lineChart_margin.width + lineChart_margin.left + lineChart_margin.right)
        .attr("height", lineChart_margin.height + lineChart_margin.top + lineChart_margin.bottom)

    // Create a chartGroup and nudge it to the top left
    var lineChart_Group = lineChart_Svg.append("g")
        .attr("transform", `translate (${lineChart_margin.left}, ${lineChart_margin.top})`)

    // Read data in

    d3.csv("[---insert filename here---]" , function(data) {

        //retrieve date range and 
        
        // Create a list of the groups from the data
        var lineChart_Group = ["valueA", "valueB", "valueC"];

        // Add all options to the button
        d3.select("#lineChart_YearButton")
            .selectAll('lineChart_Options')
     	        .data(lineChart_Group)
            .enter()
    	        .append('lineChart_Option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d) { return d; }) // corresponding value returned by the button
    
        // Add X axis 
        var x = d3.scaleLinear()
            .domain([0,10])
            .range([ 0, width ]);
        lineChart_Svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain( [0,20])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Initialize data with first group
        var lineChart_Line = svg
            .append('g')
            .append("path")
                .datum(data)
                .attr("d", d3.line()
                    .x(function(d) { return x(+d.time) })
                    .y(function(d) { return y(+d.valueA) })
                )
                .attr("stroke", function(d){ return myColor("valueA") })
                .style("stroke-width", 4)
                .style("fill", "none")

        // Update function
        function lineChart_update(selectedGroup) {

            // Create new data with the selection?
            var lineChart_dataFilter = data.map(function(d){return {time: d.time, value:d[selectedGroup]} })

            // New data to update line
            line
            .datum(lineChart_dataFilter)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
            .x(function(d) { return x(+d.time) })
            .y(function(d) { return y(+d.value) })
            )
            .attr("stroke", function(d){ return myColor(selectedGroup) })
            }

        // When change occurs, run the update function
        d3.select("#lineChart_YearButton").on("change", function(d) {
            // recover the option that has been chosen
            var selectedOption = d3.select(this).property("value")
            // run the updateChart function with this selected option
            update(selectedOption)
        })

        })

        

