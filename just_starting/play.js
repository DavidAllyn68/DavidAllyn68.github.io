var margin = {top: 80, right: 60, bottom: 80, left: 150},
    width = 1500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, .3);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5,"$~s");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//upon loading the tab delimited file
//the domain for the x/y is set
d3.tsv("FY20_Giving_By_School.txt", type, function(error, data) {
  x.domain(data.map(function(d) { return d.SchoolName; }));
  y.domain([0, d3.max(data, function(d) { return d.TotalRevenueAmount; })]);

  svg.append("text")
      .attr("class", "title")
      .attr("x", x(data[0].SchoolName))
      .attr("y", -26)
      .text("UCLA Giving by School in FY20");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll(".tick text")
      .call(wrap, x.rangeBand());

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.SchoolName); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.TotalRevenueAmount); })
      .attr("height", function(d) { return height - y(d.TotalRevenueAmount); });
});

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

function type(d) {
  //show as $M
  d.TotalRevenueAmount = +d.TotalRevenueAmount/1000000;
  return d;
}
