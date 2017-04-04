var	margin = {top: 40, right:70, bottom: 20, left: 70},
		width = window.innerWidth - margin.left - margin.right;
		height = 190 - margin.top - margin.bottom;

var stroke_off = {
	width: 6,
	opacity: 1
}, stroke_on = {
	width: stroke_off.width + (stroke_off.width * .1),
	opacity: 1
};

// variables for patterns
var pattern_path = "M-1,1 l4,-4 M0,8 l8,-8 M7,9 l4,-4";
var pattern_dim = "8";
var pattern_stroke = "3.5";
var choro_path = "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2";
var choro_dim = "4";
var choro_stroke = "1.8";

// add the patterns for each color
colors.forEach(function(d){
  // var value = colors[d];
  $("#patterns").append('<svg width="1" height="1"><defs><pattern id="diagonalHatch-' + d.slug + '" patternUnits="userSpaceOnUse" width="' + pattern_dim + '" height="' + pattern_dim + '"><path d="' + pattern_path + '" style="stroke:' + d.color + '; stroke-width:' + pattern_stroke +'"></path></pattern></defs></svg>')
});

// years (each one gets a chart)
var years = ["all","2016","2015","2014","2013","2012","2011","2010","2009","2008"];

allSeasons(years[0]);

// vertical
function allSeasons(year){

	var svg = d3.select(".viz-wrapper.vw-" + year).append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

	var g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	  
	var xScale = d3.scaleLinear().range([0, width]),
		yScale = d3.scaleLinear().range([height, 0]);

	var xAxis = d3.axisTop(xScale)
			.tickValues([1,43,78,118,164,212,260,298,339])
			.tickSizeInner(-height - margin.bottom)

// d3.curveCatmullRom.alpha(1)
//d3.curveStepAfter
	var line = d3.line()
	    .curve(d3.curveBundle.beta(1))
	    .x(function(d) { return xScale(d.index); })
	    .y(function(d) { return yScale(d.position); })
	    .defined(function(d) { return isNaN(d.position) ? false : true; });

	d3.queue()
		.defer(d3.csv, "data/viz2.csv")
		.defer(d3.csv, "data/date_lookup.csv")
		.defer(d3.csv, "data/data.csv")
		.await(ready)

	function ready(error, positions, lookup, stats) {
	  if (error) throw error;

	  // positions types function
	  positions.forEach(function(d, _, columns) {
		  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
		  return d;
		});

	  // lookup types function
	  lookup.forEach(function(d){
	  	d.index = +d.index;
	  	return d;
	  });

	  var teams = positions.columns.slice(1).map(function(id) {
	    return {
	      id: id,
	      values: positions.map(function(d) {
	        return {index: +d.index, position: +d[id]};
	      })
	    };
	  });

	  xScale.domain(d3.extent(positions, d => +d.index));

		yScale.domain([
	    d3.max(teams, function(c) { return d3.max(c.values, function(d) { return d.position; }); }),
	    d3.min(teams, function(c) { return d3.min(c.values, function(d) { return d.position; }); })
	  ]);

		xAxis.tickFormat(d => {
			return formatYear(lookup.filter(c => c.index == d)[0].date) + "→"
		});

	  var xAxisEl = g.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + -10 + ")")
	      .call(xAxis);

	  xAxisEl.append("text")
	  		.attr("class","time-label")
	  		.attr("y", -18)
	  		.attr("x", 27)
	  		.text("Season")

	  d3.selectAll(".axis.axis--x .tick text")
	  		.attr("text-anchor", "start")

	  var yAxisEl = g.append("g")
	      .attr("class", "axis axis--y")
	      .call(d3.axisLeft(yScale))
	      .attr("transform", "translate(-20," + 0 + ")")
	  
	  yAxisEl.append("text")
	  		.attr("class", "time-label")
	      .attr("transform", "rotate(-90)")
	      .attr("y", -margin.left + 30)
	      .attr("dy", "0.71em")
	      .attr("fill", "#000")
	      .text("Best →");

	  yAxisEl.append("text")
	  		.attr("class", "time-label")
	  		.attr("transform", "rotate(-90)")
	      .attr("y", -margin.left + 30)
	      .attr("x", -height)
	      .attr("text-anchor", "start")
	      .attr("dy", "0.71em")
	      .attr("fill", "#000")
	      .text("← Worst");

	  var team = g.selectAll(".team")
	    .data(teams)
	    .enter().append("g")
	      .attr("class", function(d) { return "team unset " + slugify(d.id); })
	      .on("mouseover", mouseover)
	      .on("mouseout", mouseout);

		// white line
	  team.append("path")
	      .attr("class", function(d) { return "line-out " + slugify(d.id); })
	      .attr("d", function(d) { return line(d.values); })
	      .style("stroke", d => colors.filter(c => c.slug == slugify(d.id))[0].bg)
	      .style("stroke-width", stroke_off.width + 4)
	      .style("opacity", stroke_off.opacity)
	      .on("mouseover", mouseover)
	      .on("mouseout", mouseout);

	  // colored line
	  team.append("path")
	      .attr("class", function(d) { return "line " + slugify(d.id); })
	      .attr("d", function(d) { return line(d.values); })
	      .style("stroke", d=> {
	      	// return colors.filter(c => c.slug == slugify(d.id))[0].color
	      	return "url(#diagonalHatch-" + slugify(d.id) + ")"
	      })
	      .style("stroke-width", stroke_off.width)
	      .style("opacity", stroke_off.opacity)
	      .on("mousemove", mouseover)
	      .on("mouseout", mouseout);


	 	// create a select box
	 	$("#all-seasons-select select").append("<option></option>")
	  _.sortBy(teams, "id").forEach(function(d){
	  	
	  	$("#all-seasons-select select").append("<option value='" + slugify(d.id) + "'>" + d.id + "</option>")

	  });

		$("#all-seasons-select select").chosen({
			allow_single_deselect: true
		}).change(function(){
			var val = $(this).val();
			if (val == ""){
				$(".team").removeClass("set").addClass("unset");
				mouseout();
			} else {
				$(".team").removeClass("set").addClass("unset");
				$(".team." + val).removeClass("unset").addClass("set");
				highlight(val);	
			}
			
		});

	  $(".viz-wrapper.vw-" + year).append("<div class='tip'></div>")
	  $(".tip").hide();

	  function mouseover(d){

	  	highlight(slugify(d.id));

	  	var coordinates = [0, 0];
			coordinates = d3.mouse(this);
			var x = coordinates[0];
			var y = coordinates[1];

			// get index and position based on mouse location
			var team = d.id;
			var index = Math.round(xScale.invert(x));
			var position = d.values.filter(c => c.index == index)[0].position;
			
			// lookup date
			var date = lookup.filter(c => c.index == index)[0].date;

	  	// lookup more data
	  	var date_stats = stats.filter(c => c.date == date && c.team == team)[0];
	  	var wins = date_stats.wins;
	  	var losses = date_stats.losses;

	  	var suffix = position == 1 ? "st" : position == 2 ? "nd" : position == 3 ? "rd" : "th";

	  	
	  	// populate the tip
	  	$(".tip").show();
	  	$(".tip").empty();
	  	$(".tip").addClass("show-" + position);
	  	$(".tip").append("<div class='title'>" + team + "</div>");
	  	$(".tip").append("<div class='date'>" + formatDate(date) + "</div>");
	  	$(".tip").append("<div class='position'>" + position + suffix + " place</div>");
	  	$(".tip").append("<table class='wl-table'><tr class='head'><td>Wins</td><td>Losses</td></tr><tr><td>" + wins + "</td><td>" + losses+ "</td></tr></table>")

	  	// position the tip
	  	// top
	  	var tip_top = $(".viz-wrapper.vw-" + year).offset().top - $(".tip").height();
	  	
	  	// left
	  	// determine left side of svg
	  	var svg_left = (window.innerWidth / 2) - (width / 2);
	  	var tip_left = xScale(index) - 15;

	  	$(".tip").css({
	  		top: tip_top - 10,
	  		left: tip_left,
	  		border: "2px solid " + colors.filter(c => slugify(d.id) == c.slug)[0].bg
	  	});

	  }

	  // highlight selected
	  function highlight(state_slug){

	  	d3.selectAll(".team.unset .line-out")
	  			.style("opacity", ".2");
	  	
	  	d3.selectAll(".team.unset .line")
	  		.style("opacity", ".2");

	  	d3.select(".line-out." + state_slug)
	  			.style("opacity", stroke_on.opacity)
	  			.style("stroke-width", stroke_on.width + 6);

	  	d3.select(".line." + state_slug)
	  			.style("opacity", stroke_on.opacity)
	  			.style("stroke-width", stroke_on.width);
	  	
	  	d3.select(".team." + state_slug).moveToFront();

  	}

  	// FUNCTION WHEN MOUSE OUT OF A TEAM
	  function mouseout(){


	  	// if no teams are set, show them all
	  	if (!$(".team").hasClass("set")){
	  	
		  	d3.selectAll(".team.unset .line-out")
		  			.style("opacity", stroke_off.opacity)
		  			.style("stroke-width", stroke_off.width + 4)
	
		  	d3.selectAll(".team.unset .line")
		  			.style("opacity", stroke_off.opacity)
		  			.style("stroke-width", stroke_off.width)

	  	} else {

		  	d3.selectAll(".team.unset .line-out")
		  			.style("opacity", ".2")
		  			.style("stroke-width", stroke_off.width + 4)
	
		  	d3.selectAll(".team.unset .line")
		  			.style("opacity", ".2")
		  			.style("stroke-width", stroke_off.width)

		  	d3.select(".team.set").moveToFront();

	  	}

	  	$(".tip").hide();
	  

	  }
	} // end ready()

	function slugify(text) {
	  return text.toString().toLowerCase()
	    .replace(/\s+/g, '-')           // Replace spaces with -
	    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
	    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
	    .replace(/^-+/, '')             // Trim - from start of text
	    .replace(/-+$/, '');            // Trim - from end of text
	}
}

// date parser
function formatDate(date){
	var spl = date.split("-");
	if (spl[2] == undefined){
		return " "
	} else { 
		return spl[0] + " " + spl[1] + ", " + "20" + spl[2];
	}
}

function formatMonth(date){
	var spl = date.split("-");
	if (spl[2] == undefined){
		return " "
	} else { 
		return spl[1] + ", " + "20" + spl[2];
	}
}

function formatYear(date){
	var spl = date.split("-");
	if (spl[2] == undefined){
		return " "
	} else { 
		return "20" + spl[2];
	}
}









// data parser

// var width = window.innerWidth, height = 600;

// var svg = d3.select("#viz").append("svg")
// 		.attr("width", width)
// 		.attr("height", height);

// // scales
// var xScale = d3.scaleTime()
// 		.range([0, width]);

// var yScale = d3.scaleLinear()
// 		.range([height, 0]);

// // axes
// var xAxis = d3.axisBottom(xScale)
// 	.ticks(d3.timeWeek.every(15))

// var line = d3.line()
//     .x(function(d) { return xScale(d.date); })
//     .y(function(d) { return yScale(d.position); });
//     // .curve(d3.curveBasis)

// // load data

// d3.csv("data/data.csv", types, (error, data) => {

// 	data = _.sortBy(data, "date_format");

// 	var teams = _.chain(data).pluck("team").uniq().value();

// 	var parsed = _.chain(data).pluck("date").uniq().value().map((date, index) => {

// 		var obj = {};
// 		obj.date = date;
// 		obj.index = index + 1;

// 		// teams.forEach(team => {
// 		// 	var filter = data.filter(c => c.date == date && c.team == team); 
// 		// 	obj[team] = filter[0] ? filter[0].position : "NA" ;
// 		// });

// 		return obj;

// 	});

// 	document.write(JSON.stringify(parsed));


// });

// function types(d){
// 	d.date_format = new Date(d.date);
// 	d.position = +d.position;
// 	d.year = d.date_format.getFullYear();
// 	return d;
// }
