// Global variables
let lastSelectedIndicator = "fgp";
let lastSelectedTeam = null;

const margin3 = { top: 40, right: 30, bottom: 100, left: 80 },
    width3 = 600 - margin3.left - margin3.right,
    height3 = 400 - margin3.top - margin3.bottom;

const svg3 = d3.select("#svg_lineplot")
    .append("svg")
    .attr("width", width3 + margin3.left + margin3.right)
    .attr("height", height3 + margin3.top + margin3.bottom)
    .append("g")
    .attr("transform", `translate(${margin3.left}, ${margin3.top})`);

// Define scales and axes
const xScale = d3.scaleBand().range([0, width3]).padding(0.1);
const yScale = d3.scaleLinear().range([height3, 0]);

const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

// Draw X axis
svg3.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height3})`);

// Draw Y axis
svg3.append("g")
    .attr("class", "y axis");

// Title
svg3.append("text")
    .attr("class", "title")
    .attr("x", (width3 / 2))
    .attr("y", 0 - (margin3.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px");

// Add X axis label
const xAxisLabel = svg3.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width3)
    .attr("y", height3 + margin3.top + 20)
    .text("Year")
    .style("display", "none"); // Initially hide

// Add Y axis label
const yAxisLabel = svg3.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -margin3.left + 20)
    .attr("x", -margin3.top)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Value")
    .style("display", "none"); // Initially hide

// Function to update the line plot based on the selected indicator and team
function updateLinePlot(selectedIndicator = lastSelectedIndicator, selectedTeam = lastSelectedTeam) {
    // Fetch data based on the selected indicator
    d3.csv("/lineplot").then(function (data) {
        // Aggregate data by season and calculate mean value for each season
        const filteredData = data.filter(d => d.team_name === selectedTeam);
        // Season column is in the form year1-year2; we extract year1
        const aggregatedData = d3.group(filteredData, d => d.season.split("-")[0]);

        // Calculate mean value for each season for percent values
        let aggregatedArray;
        if (selectedIndicator == "fgp" || selectedIndicator == "fg3p" || selectedIndicator == "fg2p" || selectedIndicator == "ftp") {
            aggregatedArray = Array.from(aggregatedData, ([key, values]) => ({
                year: key,
                value: d3.mean(values, d => +d[selectedIndicator])
            }));
        }
        // Calculate sum value for each season for other values
        else {
            aggregatedArray = Array.from(aggregatedData, ([key, values]) => ({
                year: key,
                value: d3.sum(values, d => +d[selectedIndicator])
            }));
        }

        // Update scales and axes domain
        xScale.domain(aggregatedArray.map(d => d.year));
        yScale.domain([0, d3.max(aggregatedArray, d => d.value)]).nice();

        // Update X axis
        svg3.select(".x.axis")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("dy", "0.35em")
            .attr("dx", "-0.5em");

        // Update Y axis
        svg3.select(".y.axis")
            .call(yAxis);

        // Define line function
        const line = d3.line()
            .x(d => xScale(d.year) + xScale.bandwidth() / 2)
            .y(d => yScale(d.value));

        // Update data for the line
        const linePath = svg3.selectAll(".line").data([aggregatedArray]);

        linePath.enter().append("path")
            .attr("class", "line")
            .merge(linePath)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .transition()
            .duration(500)
            .attr("d", line);

        linePath.exit().remove();

        // Update title with selected indicator and team
        svg3.select(".title")
            .text(`${selectedIndicator} for ${selectedTeam} players`);

        // Set axis labels visibility
        svg3.selectAll(".x.label, .y.label")
            .style("display", "block");

    }).catch(function (error) {
        console.log("Error loading the data: " + error);
    });
}

// Function to handle the change in the indicator dropdown menu
function changeIndicator(selectElement) {
    const selectedIndicator = selectElement.value;
    lastSelectedIndicator = selectedIndicator;

    // Update the line plot with the selected indicator and last selected team
    updateLinePlot(selectedIndicator, lastSelectedTeam);
}

// Function to handle the change in choosing a team on PCA scatterplot
function changeTeam(teamName) {
    lastSelectedTeam = teamName;

    // Update the line plot with the selected team and last selected indicator
    updateLinePlot(lastSelectedIndicator, lastSelectedTeam);
}
