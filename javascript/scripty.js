var width = 300;
var height = 300;
var svg = d3.select("#svgcontainer")
   .append("svg")
   .attr("width", width)
   .attr("height", height);
svg.append("line")
   .attr("x1", 100)
   .attr("y1", 100)
   .attr("x2", width)
   .attr("y2", height)
   .style("stroke", "rgb(255,0,0)")
   .style("stroke-width", 2);
