//returns the size of the browser
function getWindowSize() {
  var win_size = new Array;
  if (self.innerHeight) {
    win_size['height'] = self.innerHeight;
    win_size['width'] = self.innerWidth;
  } else if (document.documentElement && document.documentElement.clientHeight) {
    win_size['height'] = document.documentElement.clientHeight;
    win_size['width'] = document.documentElement.Width;
  } else if (document.body) {
    win_size['height'] = document.body.clientHeight;
    win_size['width'] = document.body.clientWidth;
  }
  return win_size;
}

//the general dimensions of the clock
var width = 600,
    height = 600,
    radius = Math.min(width, height) / 1.9,
    spacing = .08; //the spacing between bars .1 is where the bars touch

//this was at the very end of the code - what is it for??
//I commented it out with no effect
//d3.select(self.frameElement).style("height", height + "px");

//display formatting for the various elements of time
var formatSecond = d3.time.format("%-S seconds"),
    formatMinute = d3.time.format("%-M minutes"),
    formatHour = d3.time.format("%-H hours"),
    formatDay = d3.time.format("%A"),
    formatDate = function(d) { d = d.getDate(); switch (10 <= d && d <= 19 ? 10 : d % 10) { case 1: d += "st"; break; case 2: d += "nd"; break; case 3: d += "rd"; break; default: d += "th"; break; } return d; },
    formatMonth = d3.time.format("%B");

//the full display for various elements of time
//this acts as the data for the tick
function timeData() {
  var now = new Date;
  return [
    {index: .7, text: formatSecond(now), value: now.getSeconds() / 60},
    {index: .6, text: formatMinute(now), value: now.getMinutes() / 60},
    {index: .5, text: formatHour(now),   value: now.getHours() / 24},
    {index: .3, text: formatDay(now),    value: now.getDay() / 7},
    {index: .2, text: formatDate(now),   value: (now.getDate() - 1) / (32 - new Date(now.getYear(), now.getMonth(), 32).getDate())},
    {index: .1, text: formatMonth(now),  value: now.getMonth() / 12}
  ];
}

//the color scale to use for the progression of time
var bar_color = d3.scale.linear()
    .range(["hsl(210, 77%, 30%)", "hsl(210, 77%, 100%)"])
    .interpolate(function(a, b) { var i = d3.interpolateString(a, b); return function(t) { return d3.hsl(i(t)); }; });

//building the clock elements themselves
var arcBody = d3.svg.arc()
    .startAngle(0)
    .endAngle(function(d) { return d.value * 2 * Math.PI; })
    .innerRadius(function(d) { return d.index * radius; })
    .outerRadius(function(d) { return (d.index + spacing) * radius; })
    .cornerRadius(6);

var arcCenter = d3.svg.arc()
    .startAngle(0)
    .endAngle(function(d) { return d.value * 2 * Math.PI; })
    .innerRadius(function(d) { return (d.index + spacing / 2) * radius; })
    .outerRadius(function(d) { return (d.index + spacing / 2) * radius; });


//create canvas the full height and width of the page
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    //create a gouping and move it to center
  .append("g")
    //translates the center of the clock
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


var field = svg.selectAll("g")
    .data(timeData)
  .enter().append("g");

//append an arc body and arc center for each time element
field.append("path")
    .attr("class", "arc-body");

field.append("path")
    .attr("id", function(d, i) { return "arc-center-" + i; })
    .attr("class", "arc-center");

//create the display text with rotation
field.append("text")
    .attr("dy", ".35em")
    .attr("dx", ".75em")
    .style("text-anchor", "start")
  .append("textPath")
    .attr("startOffset", "50%")
    .attr("class", "arc-text")
    .attr("xlink:href", function(d, i) { return "#arc-center-" + i; });

//calculating the position around the clock??
function arcTween(arc) {

  return function(d) {
    var i = d3.interpolateNumber(d.previousValue, d.value);

    return function(t) {
      d.value = i(t);
      return arc(d);
    };

  };

};

// updating the movement of the bar??
function fieldTransition() {
  var field = d3.select(this).transition();

  field.select(".arc-body")
      .attrTween("d", arcTween(arcBody))
      .style("fill", function(d) { return bar_color(d.value); });

  field.select(".arc-center")
      .attrTween("d", arcTween(arcCenter));

  field.select(".arc-text")
      .text(function(d) { return d.text; });
}

//what should happen with each tick?
function tick() {
  if (!document.hidden) field
      .each(function(d) { this._value = d.value; })
      .data(timeData)
      .each(function(d) { d.previousValue = this._value; })
    .transition()
      .ease("elastic")
      .duration(1000)
      .each(fieldTransition);

  //do this every second
  setTimeout(tick, 1000 - Date.now() % 1000);
}
// do each tick
tick();
