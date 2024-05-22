//(function() {
// set the dimensions and margins of the graph
const margin = {top: 10, right: 20, bottom: 150, left: 130},
  width = 900 - margin.left - margin.right,
  height = 650 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#heatmap")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Read the data
d3.csv("/long").then(function(data) {

  // Labels of row and columns -> unique identifier of the column called 'team' and 'variable'
  const myGroups = Array.from(new Set(data.map(d => d.team)))
  const myVars = Array.from(new Set(data.map(d => d.variable)))

  // Build X scales and axis:
  const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(myGroups)
    .padding(0.05);
  const xAxis = svg.append("g")  // Add x-axis group
    .attr("class", "x-axis")     // Add class for selection
    .style("font-size", 12)
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-60)");

  // Build Y scales and axis:
  const y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(myVars)
    .padding(0.05);
  svg.append("g")
    .style("font-size", 12)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Build color scale
  const myColor = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([1,0]) // reverse color palette

  // create a tooltip
  const tooltip = d3.select("#heatmap")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")

    // map colour for colouring scatterplot
    const colorMap = new Map();
    data.forEach(d => {
        const key = d.variable; // Use variable as the key for each row
        if (!colorMap.has(key)) {
            colorMap.set(key, new Map()); // Initialize a map for each row if it doesn't exist
        }
        colorMap.get(key).set(d.team, myColor(d.color)); // Store color for each team in the row map
    });

   // Three functions that change the tooltip when user hover / move / leave a cell
  const mouseover = function(event,d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)

    teamHeatmap(d.team);

    const key = d.variable; // Get the variable for the hovered row
    const rowColorMap = colorMap.get(key); // Get the map of colors for the row
    const cteam = d.team;

    // Apply colors to corresponding points on scatterplot
     svg2.selectAll("circle")
        .style("fill", d => {
     const color = rowColorMap.get(d.Team) // Get the color for the team from the row map
     return color ? color : "#69b3a2" // Use the color if available, otherwise use default color
     })
  }

  const mousemove = function(event,d) {
     // Calculate the position of the tooltip relative to the mouse cursor
    const tooltipX = event.pageX + 10; // Add an offset of 10px to the right
    const tooltipY = event.pageY - 30; // Subtract an offset of 30px to move slightly above the cursor

    tooltip
      .html(d.team + "<br>" + d.value)
      .style("left", tooltipX + "px")
      .style("top", tooltipY + "px")
  }

  const mouseleave = function(event,d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)

      noTeamHeatmap()

       svg2.selectAll("circle")
                .style("fill", "#69b3a2") // Set to default color or initial state
                .style("stroke", "none"); // Reset outline
  }

  // add the squares
  svg.selectAll()
    .data(data, function(d) {return d.team+':'+d.variable;})
    .join("rect")
      .attr("x", function(d) { return x(d.team) })
      .attr("y", function(d) { return y(d.variable) })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.color)} )
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    svg.selectAll(".x-axis text")
       .on("mouseover", function(event,d) {
       //console.log(event.explicitOriginalTarget.nodeValue)
            teamHeatmap(event.explicitOriginalTarget.nodeValue)
       })
       .on("mouseleave", function(d) {
            noTeamHeatmap()
       });
})
//}) ();

function teamPca(selectedTeam) {
    // Bold the text for the specified team name
    svg.selectAll(".x-axis text")  // Correct selector to target text within the x-axis group
        .style("font-weight", function(d) {
            return d === selectedTeam ? "bold" : "normal";
        });
}

function noTeamPca() {
    // Remove bold font weight from all text on the x-axis
    svg.selectAll(".x-axis text")  // Correct selector to target text within the x-axis group
        .style("font-weight", "normal");
}

//function noTeamHeatmap() {
//    svg2.selectAll("circle")
//        .style("stroke", "none")
//        .attr("r", 4);
//}


