//Define SVG area dimensions
var svgWidth = 900;
var svgHeight = 500;

// Define the chart's margins as an object
var chartMargin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Initial x & y params
var chosenxAxis = "poverty";
var chosenyAxis = "obesity";


//Function used to scale x axis to statedata
function xScale(data, chosenxAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenxAxis]),
    d3.max(data, d => d[chosenxAxis])
    ])
    .range([0, chartWidth]);
  return xLinearScale;
}

//Function used to scale y axis to statedata
function yScale(data, chosenyAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenyAxis]),
    d3.max(data, d => d[chosenyAxis])
    ])
    .range([0, chartWidth]);
  return yLinearScale;
}

//Function used to update x-axis based on selected data 
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}
//Function used to update y-axis based on selected data
function renderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisBottom(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenxAxis, chosenyAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenxAxis]))
    .attr("cy", d => newYScale(d[chosenyAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenxAxis, circlesGroup) {

  if (chosenxAxis === "poverty") {
    var xlabel = "Poverty(%)";
  }
  else if (chosenxAxis === "age") {
    var xlabel = "Age";
  }
  else {
    var xlabel = "Household Income";
  }

  if (chosenyAxis === "obesity") {
    var ylabel = "Obesity(%)";
  }
  else if (chosenyAxis === "smokes") {
    var ylabel = "Smokes(%)";
  }
  else {
    var ylabel = "Lacks Healthcare(%)";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.state}<br>${xlabel}: ${d[chosenxAxis]}<br>${ylabel}: ${chosenyAxis}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function (data) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

//Import CSV
d3.csv("../data/data.csv").then(function (data) {

  //Parse data
  data.forEach(function (data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    console.log(data);
  });

  // xLinearScale and yLinearScale function above csv import
  var xLinearScale = xScale(data, chosenxAxis);
  var yLinearScale = yScale(data, chosenyAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenxAxis]))
    .attr("cy", d => yLinearScale(d[chosenyAxis]))
    .attr("r", 10)
    .attr("class", "stateCircle")
    .attr("opacity", "1");

  // Create groups for  3 x- and y- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`)
    .attr("class", "aText");
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartHeight / 2}, ${svgWidth - 880})`)
    .attr("class", "aText");

  //Identify x labes
  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");
  //identify y labels
  var obesityLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - chartMargin.Left - 5)
    .attr("x", 0 - (chartHeight / 2))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0- chartMargin.Left-5)
    .attr("x", 0 - (chartHeight/2))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes");

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-chartMargin.Left-5)
    .attr("y", 0 -(chartHeight/2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenxAxis, chosenyAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var xvalue = d3.select(this).attr("value");
      if (xvalue !== chosenxAxis) {

        // replaces chosenXAxis with value
        chosenxAxis = xvalue;

        // console.log(chosenxAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenxAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenxAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenxAxis, circlesGroup);

        // changes x classes to change bold text
        if (chosenxAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);

        }
        else if (chosenxAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false)
        }
      }
    });

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var yvalue = d3.select(this).attr("value");
      if (yvalue !== chosenyAxis) {

        // replaces chosen yAxis with value
        chosenyAxis = yvalue;

        // console.log(chosenyAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(data, chosenyAxis);

        // updates x axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenyAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenyAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenyAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenyAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true)
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});

