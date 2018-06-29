var width = 960;
var height = 570;

d3.select("#heading")
    .append("h1")
    .attr("id","title")
    .text("Treemap Diagram")

d3.select("#heading").insert("h2")
  .attr("id","description")
  .text("A D3 based treemap visualization")

// div for tooltip
var div = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)

var svg = d3.select("#treemap")
    // set viewBox attribute on the wrapper for responsive svg
    .attr("style","padding-bottom: " + Math.ceil(height * 90/width) + "%")
    .append("svg")
    // .attr("width", width)
    // .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height);

// tone down the colors with a fader function
var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
    // scaleOrdinal maps a set of named categories(movie category) to a set of colors
    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
    format = d3.format(",d");

var treemap = d3.treemap()
    .size([width, height])
    .paddingInner(1);

// get the data 
d3.json("https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json", function(error, data) {
  if (error) throw error;
  // construct a root node for the legend
  var legendRoot = d3.hierarchy(data);

  categoryLegend()

  // get your root node
  var root = d3.hierarchy(data)
      // eachBefore Invokes the specified function for node and each descendant
      // in  pre-order traversal, ancestors first
      .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
      // call root.sum before passing the hierarchy to the treemap
      .sum(function(d) { return d.value; })
      // call root.sort to order the hierarchy before computing the layout
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

  // pass the hierarchical layout treemap our root node
  treemap(root);

  // create a group element for each leaf
  var cell = svg.selectAll("g")
  //root.leaves() returns an array leaf nodes,leaves are nodes with no children.
    .data(root.leaves())
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

  cell.append("rect")
      .attr("class", "tile")
      .attr("data-name",function(d) { return d.data.name; })
      .attr("data-category",function(d) { return d.data.category; })
      .attr("data-value",function(d) { return d.data.value; })
      .attr("id", function(d) { return d.data.id; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .attr("data-value",function(d) { return d.data.value; })
      // fill with movie category maped to our scaleOrdinal color fn
      .attr("fill", function(d) {
        return color(d.parent.data.name);
      })
      // add our tooltip on mouseover/mouseout
      .on("mouseover", function(d) {
        div.transition()
        .duration(200)
        .style("opacity", .9);
        //div.html(function(d) { return d.data.name; }+ "<br/" +
        div.html("Value :"+ " " + d.data.value)
        .attr("data-value", d.data.value)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY -28) + "px");
      })
      .on("mouseout", function(d) {
        div.transition()
        .duration(500)
        .style("opacity", 0);
      })

  // Legend
  function categoryLegend() {
  // Draw the category legend
    var legend = d3.select("#legend")
      .attr("style","padding-bottom: " + Math.ceil(80 * 90/width) + "%")
    .append("svg")
      .attr("viewBox", "0 0 " + width + " " + 80)
        // .attr("width", width)
        // .attr("height", height)
    .selectAll(".legend")
        .data(legendRoot.children.map(x => x.data.name))
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
          return "translate(" + i * 80 + ", 0 )";
        });

    legend.append("rect")
        .attr("x", width *.25)
        .attr("y", 20)
        .attr("width", 28)
        .attr("height", 28)
        .attr("class", "legend-item")
        .style("fill", function(d) {
          return color(d);
        });

    legend.append("text")
        .attr("x", function(d) {
          // center Biography text
          if(d == "Biography") return width *.25 + 38;
          return width *.25 + 30;
        })
        .attr("y", 58)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {
          return d;
      });
  }

  // add movie names to each cell
  cell.append("text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
    .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
      .attr("x", 4)
      .attr("y", function(d, i) { return 13 + i * 10; })
      .text(function(d) { return d; });

});
