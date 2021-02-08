// Dimensions of sunburst.
var width = 800;
var height = 800;
var radius = Math.min(width, height) / 2;

// Mapping of step names to colors.
var colors = { "Chancellor's Greatest Needs":"#e6bbb2",
"Fielding School of Public Health":"#e6bb9b",
"College of Letters and Science":"#d5c5a1",
"School of Nursing":"#c9d2a8",
"Intercollegiate Athletics":"#ced3be",
"David Geffen School of Medicine":"#daf4c5",
"UCLA Samueli":"#aed0a0",
"General Campus":"#acd8ba",
"School of Law":"#9db7b1",
"School of the Arts and Architecture":"#72c8b8",
"School of Dentistry":"#c6e1db",
"UCLA Herb Alpert School of Music":"#a1d8cd",
"International Institute":"#94d9df",
"UCLA Library":"#add4e0",
"UCLA Anderson":"#7cd3eb",
"Luskin School of Public Affairs":"#99ceeb",
"Student Affairs":"#a1bde6",
"Institute of American Cultures":"#d5d2e7",
"UCLA Extension":"#b3b0c4",
"School of Theater, Film and Television":"#cab8e5",
"Graduate School of Education and Information Studies":"#e9b4cb",
"Graduate Education":"#e0c7ce" };

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


var partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);

var arc = d3.arc()
    .startAngle(function(d) { return d.x0; })
    .endAngle(function(d) { return d.x1; })
    .innerRadius(function(d) { return Math.sqrt(d.y0); })
    .outerRadius(function(d) { return Math.sqrt(d.y1); });

// Use d3.text and d3.csvParseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.
d3.text("sequences.csv", function(text) {
  var csv = d3.csvParseRows(text);
  var json = buildHierarchy(csv);
  createVisualization(json);
});

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // Turn the data into a d3 hierarchy and calculate the sums.
  var root = d3.hierarchy(json)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition(root).descendants()
      .filter(function(d) {
          return (d.x1 - d.x0 > 0.0005); // 0.005 radians = 0.029 degrees
      });

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return colors[d.data.name]; })
      .style("opacity", 1)
      .on("mouseover", mouseover);

  // Center labels
  var bigText = vis.append('text')
      .
      // .attr("id","#big-text")
      // .style("z","-1")
      // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      // .attr("text-anchor", "middle");

  // Add the mouseleave handler to the bounding circle.
  d3.select("#container").on("mouseleave", mouseleave);

  // Get total size of the tree = value of root node from partition.
  totalSize = path.datum().value;
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
  //when a user mouses over the chart,
  //highlight the section and show detail in chart center
  var giving_amount = "$" + (d.value/1000000).toPrecision(2).toString() + "M";
  var percentage = (100 * d.value / totalSize).toPrecision(3);
  var percentageString = percentage + "% of Total Giving";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }

  var sequenceArray = d.ancestors().reverse();
  sequenceArray.shift(); // remove root node from the array


  //updateBreadcrumbs(sequenceArray, percentageString);

  //var givingUnitStrings = d.map(i => i.name);
  //console.log(givingUnitStrings);

  var sequenceString = "Place Holder";
  var text = d3.selectAll("text")

  d3.selectAll("#giving_amount")
      .text(giving_amount);

  text.select("#giving_percentage")
      .text(percentageString);

  // d3.select("#giving_unit");
  //     .text(sequenceString);

  bigText.selectAll('#big-text')
     .data( ["Accessed by", 500, "students"] )
     .join('tspan')
     .attr('x', 0)
     .attr('y', -30)
     .attr('font-size', 20)
     .style('font-weight', (d,i) => i!==1 ? undefined : 'bold')
     .attr('dy', (d,i) => i ? (1.5*i) + 'em' : 0)
     .text( d => d );

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {
  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .on("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });
  d3.select("#explanation")
      .style("visibility", "hidden");
}

//------- TRANSFORM DATA --------//
// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how
// often that sequence occurred.
function buildHierarchy(csv) {
  var root = {"name": "root", "children": []};
  for (var i = 0; i < csv.length; i++) {
    var sequence = csv[i][0];
    var size = +csv[i][1];
    if (isNaN(size)) { // e.g. if this is a header row
      continue;
    }
    var parts = sequence.split("-");
    var currentNode = root;
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      if (j + 1 < parts.length) {
   // Not yet at the end of the sequence; move down the tree.
 	var foundChild = false;
 	for (var k = 0; k < children.length; k++) {
 	  if (children[k]["name"] == nodeName) {
 	    childNode = children[k];
 	    foundChild = true;
 	    break;
 	  }
 	}
  // If we don't already have a child node for this branch, create it.
 	if (!foundChild) {
 	  childNode = {"name": nodeName, "children": []};
 	  children.push(childNode);
 	}
 	currentNode = childNode;
      } else {
 	// Reached the end of the sequence; create a leaf node.
 	childNode = {"name": nodeName, "size": size};
 	children.push(childNode);
      }
    }
  }
  return root;
};
