//(function(){
// set the dimensions and margins of the graph
const margin2 = {top: 10, right: 30, bottom: 30, left: 60},
    width2 = 500 - margin2.left - margin2.right,
    height2 = 500 - margin2.top - margin2.bottom;

// append the svg object to the body of the page
const svg2 = d3.select("#pca_plot")
    .append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
    .attr("transform", `translate(${margin2.left}, ${margin2.top})`);

//Read the data
d3.csv("/pca").then( function(data) {

// Add X axis
    const x2 = d3.scaleLinear()
    .domain([-10, 10])
    .range([ 0, width2 ]);
    svg2.append("g")
    .attr("transform", `translate(0, ${height2})`)
    .call(d3.axisBottom(x2));

    // Add Y axis
    const y2 = d3.scaleLinear()
    .domain([-10, 10])
    .range([ height2, 0]);
    svg2.append("g")
    .call(d3.axisLeft(y2));

    const tooltip = d3.select("#pca_plot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")

    const mouseover = function(event,d) {
        tooltip
            .style("opacity", 1)
            d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)

        teamPca(d.Team);
    }

    const mousemove = function(event,d) {
         // Calculate the position of the tooltip relative to the mouse cursor
        const tooltipX = event.pageX + 10; // Add an offset of 10px to the right
        const tooltipY = event.pageY - 30; // Subtract an offset of 30px to move slightly above the cursor

        tooltip
            .html(d.Team)
            .style("left", tooltipX + "px")
            .style("top", tooltipY + "px")
    }

    const mouseleave = function(event,d) {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
        noTeamPca()
    }

    // Add dots
    svg2.append('g')
    .selectAll("dot")
    .data(data)
    .join("circle")
        .attr("cx", function (d) { return x2(d.PC1); } )
        .attr("cy", function (d) { return y2(d.PC2); } )
        .attr("r", 4)

        .style("fill", "#69b3a2")
        .style("stroke", "none")
        .on("click", function(event, d) {
                // Call function to generate line plot for the selected team
                changeTeam(d.Team);
            })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

})
//}) ();

function teamHeatmap(team) {
    svg2.selectAll("circle")
        .style("stroke", function(d) {
            // If the data point's team matches the selected team, color it red, otherwise keep the default color
            return d.Team === team ? "red" : "none";
        })
        .attr("r", function(d) {
            // If the data point's team matches the selected team, color it red, otherwise keep the default color
            return d.Team === team ? 6 : 4;
        });
}

function noTeamHeatmap() {
    svg2.selectAll("circle")
        .style("stroke", "none")
        .attr("r", 4);
}