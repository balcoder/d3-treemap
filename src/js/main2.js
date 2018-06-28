d3.select("#heading")
    .append("h1")
    .attr("id","title")
    .text("Treemap Diagram")


  d3.select("#heading").insert("h2")
    .attr("id","description")
    .text("A D3 based treemap visualization")

var width = 960;
var height = 570;

var div = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)

var svg = d3.select("#treemap")
    .attr("style","padding-bottom: " + Math.ceil(height * 90/width) + "%")
    .append("svg")
    // .attr("width", width)
    // .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height);

// tone down the colors with a fader function
var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
    //color = d3.scaleOrdinal(d3.schemeCategory20),
    format = d3.format(",d");
     console.log(color("Action"));

var treemap = d3.treemap()
    //.tile(d3.treemapResquarify)
    .size([width, height])
    //.round(true)
    .paddingInner(1);


d3.json("https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json", function(error, data) {
  if (error) throw error;

   var testRoot = d3.hierarchy(data);
   console.log("hierachy :");
   console.log( testRoot);

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

  treemap(root);
  console.log("root.leaves()");
  console.log(root.leaves());

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
      //.attr("data-legend", function(d) { return d.data.category; })
      .attr("fill", function(d) {
        //console.log(d.parent.data.name + ": " + color(d.parent.data.id));
        console.log(d.parent.data.name);
        return color(d.parent.data.id);

      })
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

      //categoryLegend()



    //  console.log(testRoot.children.map(x => color(x.data.name)));
  function categoryLegend() {
  // Draw the category legend
  var legend = d3.select("#legend")
    .attr("style","padding-bottom: " + Math.ceil(80 * 90/width) + "%")
  .append("svg")
    .attr("viewBox", "0 0 " + width + " " + 80)
      // .attr("width", width)
      // .attr("height", height)
  .selectAll(".legend")
      .data(testRoot.children.map(x => x.data.name))
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        //return "translate(0," + i * 20 + ")";
        return "translate(" + i * 80 + ", 0 )";
      });

  legend.append("rect")
      //.attr("x",50)
      .attr("x", width *.25)
      .attr("y", 20)
      .attr("width", 28)
      .attr("height", 28)
      .attr("class", "legend-item")
      .style("fill", function(d) {
        //return color(d);
        return color("Movies."+d);
      });

  legend.append("text")
      //.attr("x", 80)
      .attr("x", function(d) {
        if(d == "Biography") return width *.25 + 38;
        return width *.25 + 30;
      })
      .attr("y", 58)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) {
        //console.log(d);
        return d;
      });
}

      // legend = svg.append("g")
      //   .attr("class","legend")
      //   .attr("transform","translate(50,30)")
      //   .style("font-size","12px")
      //   .call(d3.legend)



  cell.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.data.id; })
    .append("use")
      .attr("xlink:href", function(d) { return "#" + d.data.id; });

  cell.append("text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
    .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
      .attr("x", 4)
      .attr("y", function(d, i) { return 13 + i * 10; })
      .text(function(d) { return d; });

  // cell.append("title")
  //     .text(function(d) { return d.data.id + "\n" + format(d.value); });
  //
  // d3.selectAll("input")
  //     .data([sumBySize, sumByCount], function(d) { return d ? d.name : this.value; })
  //     .on("change", changed);
  //
  // var timeout = d3.timeout(function() {
  //   d3.select("input[value=\"sumByCount\"]")
  //       .property("checked", true)
  //       .dispatch("change");
  // }, 2000);



  function changed(sum) {
    timeout.stop();

    treemap(root.sum(sum));

    cell.transition()
        .duration(750)
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
      .select("rect")
        .attr("width", function(d) { return d.x1 - d.x0; })
        .attr("height", function(d) { return d.y1 - d.y0; });
  }
});

function sumByCount(d) {
  return d.children ? 0 : 1;
}

function sumBySize(d) {
  return d.size;
}
