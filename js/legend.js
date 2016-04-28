function drawLegend(div,domain,range) {
var width = 750,
    height = 200,
    formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

var threshold = d3.scale.threshold()
    .domain(domain)
    .range(range);

// A position encoding for the key only.
var x = d3.scale.linear()
    .domain([0, 1])
    .range([0, 240]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(13)
    .tickValues(threshold.domain())
    .tickFormat(function(d) { return d === .5 ? formatPercent(d) : formatNumber(100 * d); });

var svg = d3.select(div)
	.append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(" + (width - 240) / 2 + "," + height / 2 + ")");

g.selectAll("rect")
    .data(threshold.range().map(function(color) {
      var d = threshold.invertExtent(color);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 10)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .style("fill", function(d) { console.log(threshold(d[0])); return threshold(d[0]); });

g.call(xAxis).append("text")
    .attr("class", "caption")
    .attr("y", -6)
    .text("Average number of students per uni per state in 2014");
}