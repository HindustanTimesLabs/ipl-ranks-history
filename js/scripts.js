var win_width = $(window).width();

if (win_width < 768){
	$(".click-tap").html("tap")
} else {
	$(".click-tap").html("drag your cursor over")
}

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

var tickValues_obj = {
	"all" : [1,43,78,118,164,212,260,298,339],
	"2016" : [339,361],
	"2015" : [298,321],
	"2014" : [260,275],
	"2013" : [212, 240],
	"2012" : [164,191],
	"2011" : [118,141],
	"2010" : [78,98],
	"2009" : [43,56],
	"2008" : [1,14]
}

// a bunch of awesome objects
var positions_filtered = {},
	year_indexes = {},
	positions_obj = {},
	lookup_obj = {};

years.forEach(function(d){
	positions_filtered[d] = [];
	year_indexes[d] = [];
	positions_obj[d] = [];
	lookup_obj[d] = [];
});

d3.queue()
		.defer(d3.csv, "data/viz2.csv")
		.defer(d3.csv, "data/date_lookup.csv")
		.defer(d3.csv, "data/data.csv")
		.await(ready);

function ready(error, positions, lookup, stats) {
  if (error) throw error;

  // populate legend
  $("#all-teams").width("100%");
  $("#legend").width("100%");

  // var teams = _.chain(stats).pluck("team").uniq().value().sort();

  // var swatch_dim = 10;
  // var swatch_pad = 0;

  // teams.forEach(function(d){

  // 	$("#all-teams").append("<div class='legend-item legend-item-" + slugify(d) + "'><svg class='legend-swatch'><rect fill='" + _.where(colors, {slug: slugify(d)})[0].bg + "' x='0' y='0' height='" + (swatch_dim + swatch_pad) + "' width='" + (swatch_dim + swatch_pad) + "'></rect><rect fill='url(#diagonalHatch-" + slugify(d) + ")' x='0' y='0' height='" + swatch_dim + "'width='" + swatch_dim + "'></rect></svg>" + d + "</div>");

  // });

  var legend_offset = $("#legend").offset().top;
  $(window).scroll(() => {

  		scrollSpy();

  });

  scrollSpy()

  function scrollSpy(){

  	var nav_height = $(".navbar").height();
  	
  	var window_offset = $(window).scrollTop();

  	if (window_offset >= legend_offset - nav_height){
  		// $(".navbar").css({
  		// 	"position": "absolute",
  		// 	"top": window_offset
  		// });
  		// $("body").css("margin-top", "0")
  		$("#legend").css({
  			"position": "fixed",
  			"top" : nav_height,
  			"background": "rgba(255, 255, 255, 0.9)",
  			"left": 0,
  			// "box-shadow": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
  		});

  		$("#story").css({
  			"margin-top": $("#legend").height()
  		});
  	} else {
  		// $(".navbar").addClass("navbar-fixed-top");
  		// $("body").css("margin-top", nav_height)
  		$("#legend").css({
  			"position": "static",
  			"box-shadow": "none"
  		});

  		$("#story").css({
  			"margin-top": 0
  		});
  	}

  }

	// var leg = d3.select("#all-teams");



	// leg.selectAll(".legend-swatch")
	// 		.data(teams)
	// 		.enter()
	// 		.append("rect")
	// 		.attr("class", "legend-swatch")
	// 		.attr("x", 2)
	// 		.attr("y", 0)
	// 		.attr("height", 10)
	// 		.attr("width", 10)
	// 		.attr("fill", d => "url(#diagonalHatch-" + slugify(d) + ")");

	// leg.selectAll(".legend-swatch-out")
	// 	.data(teams)
	// 	.enter()
	// 	.append("rect")
	// 	.attr("class", "legend-swatch")
	// 	.attr("x", (d,i) => i * 10)
	// 	.attr("y", 0)
	// 	.attr("height", 14)
	// 	.attr("width", 14)
	// 	.attr("fill", d => "url(#diagonalHatch-" + slugify(d) + ")")

  // teams.forEach(d => {
  // 	$("#all-teams").append("<rect x='0' y='0' width='10' height='10' fill='green'></rect>")
  // });

  years.forEach(draw);

  function draw(year){

  	// stash the lookup and positions
  	lookup_obj[year] = lookup;
  	positions_obj[year] = positions;

  	// filter positions by year

  	// get list of indexes for the year
  	if (year != "all"){
  		year_indexes[year] = lookup_obj[year].filter(d => d.year == year).map(d => d.index.toString());
  	} else {
  		year_indexes[year] = lookup_obj[year].map(d => d.index.toString());
  	}
  	
  	// filter the positions by year
  	year_indexes[year].forEach(d => {
  		
  		var curr_position = positions_obj[year].filter((c) => {			
  			return c.index == d
  		});

  		positions_filtered[year].push(curr_position[0]);

  	});

  	var draw_positions = positions_filtered[year];
  	draw_positions.columns = positions_obj[year].columns;;

  	// make obects for all the stuff
  	var svg = {},
  		g = {},
  		xScale = {},
  		yScale = {},
  		xAxis = {},
  		yAxis = {},
  		line = {};

  	svg[year] = d3.select(".viz-wrapper.vw-" + year).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);

		g[year] = svg[year].append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		  
		xScale[year] = d3.scaleLinear().range([0, width]),
			yScale[year] = d3.scaleLinear().range([height, 0]);

		xAxis[year] = d3.axisTop(xScale[year])
				.tickValues(tickValues_obj[year])
				.tickSizeInner(-height - margin.bottom);

		yAxis[year] = d3.axisLeft(yScale[year]).ticks(year == "all" ? 10 : 8);

		line[year] = d3.line()
		    .curve(d3.curveBundle.beta(1))
		    .x(function(d) { return xScale[year](d.index); })
		    .y(function(d) { return yScale[year](d.position); })
		    .defined(function(d) { return isNaN(d.position) ? false : true; });

	  draw_positions.forEach(function(d, _, columns) {
		  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
		  return d;
		});

	  // lookup types function
	  lookup.forEach(function(d){
	  	d.index = +d.index;
	  	return d;
	  });

	  var teams = draw_positions.columns.slice(1).map(function(id) {
	    return {
	      id: id,
	      values: draw_positions.map(function(d) {
	        return {index: +d.index, position: +d[id]};
	      })
	    };
	  });

	  xScale[year].domain(d3.extent(draw_positions, d => +d.index));

		yScale[year].domain([
	    d3.max(teams, function(c) { return d3.max(c.values, function(d) { return d.position; }); }),
	    d3.min(teams, function(c) { return d3.min(c.values, function(d) { return d.position; }); })
	  ]);

		xAxis[year].tickFormat(d => {

			var unformatted_date = lookup.filter(c => c.index == d)[0].date;

			return year == "all" ? formatYear(unformatted_date) + "→" : formatMonth(unformatted_date) + "→";
		});

	  var xAxisEl = g[year].append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + -10 + ")")
	      .call(xAxis[year]);

	  xAxisEl.append("text")
	  		.attr("class","time-label")
	  		.attr("y", -18)
	  		.attr("x", year == "all" ? 16 : 24)
	  		.text(year == "all" ? "Year" : "Month")

	  d3.selectAll(".axis.axis--x .tick text")
	  		.attr("text-anchor", "start")

	  var yAxisEl = g[year].append("g")
	      .attr("class", "axis axis--y")
	      .call(yAxis[year])
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

	  var team = g[year].selectAll(".team")
	    .data(teams)
	    .enter().append("g")
	      .attr("class", function(d) { return "team unset " + slugify(d.id); })
	      .on("mouseover", mouseover)
	      .on("mouseout", mouseout);

		// white line
	  team.append("path")
	      .attr("class", function(d) { return "line-out " + slugify(d.id); })
	      .attr("d", function(d) { return line[year](d.values); })
	      .style("stroke", d => colors.filter(c => c.slug == slugify(d.id))[0].bg)
	      .style("stroke-width", stroke_off.width + 4)
	      .style("opacity", stroke_off.opacity)
	      .on("mouseover", mouseover)
	      .on("mouseout", mouseout);

	  // colored line
	  team.append("path")
	      .attr("class", function(d) { return "line " + slugify(d.id); })
	      .attr("d", function(d) { return line[year](d.values); })
	      .style("stroke", d=> {
	      	// return colors.filter(c => c.slug == slugify(d.id))[0].color
	      	return "url(#diagonalHatch-" + slugify(d.id) + ")"
	      })
	      .style("stroke-width", stroke_off.width)
	      .style("opacity", stroke_off.opacity)
	      .on("mousemove", mouseover)
	      .on("mouseout", mouseout);


	  // body select
	  $(document).on("mouseover", ".body-select", function(){
	  	var val = $(this).attr("team");
	  	console.log(val);
	  	highlight(val);
	  }).mouseout(function(){
	  	mouseout();
	  });


	  // $(".body-select").mouseover(()=>{
	  // 	console.log($(this));
	  // 	var val = $(this).attr("data-team");
	  // 	console.log(val);
	  // 	highlight(val);
	  // }).mouseout(()=>{
	  // 	mouseout();
	  // })

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
	  $(".viz-wrapper.vw-" + year + " .tip").hide();

	  function mouseover(d){

	  	highlight(slugify(d.id));

	  	var coordinates = [0, 0];
			coordinates = d3.mouse(this);
			var x = coordinates[0];
			var y = coordinates[1];

			// get index and position based on mouse location
			var team = d.id;
			var index = Math.round(xScale[year].invert(x));
			var position = d.values.filter(c => c.index == index)[0].position;
			
			// lookup date
			var date = lookup.filter(c => c.index == index)[0].date;

	  	// lookup more data
	  	var date_stats = stats.filter(c => c.date == date && c.team == team)[0];
	  	var wins = date_stats.wins;
	  	var losses = date_stats.losses;

	  	var suffix = position == 1 ? "st" : position == 2 ? "nd" : position == 3 ? "rd" : "th";

	  	
	  	// populate the tip
	  	$(".viz-wrapper.vw-" + year + " .tip").show();
	  	$(".viz-wrapper.vw-" + year + " .tip").empty();
	  	$(".viz-wrapper.vw-" + year + " .tip").addClass("show-" + position);
	  	$(".viz-wrapper.vw-" + year + " .tip").append("<div class='title'>" + team + "</div>");
	  	$(".viz-wrapper.vw-" + year + " .tip").append("<div class='date'>" + formatDate(date) + "</div>");
	  	$(".viz-wrapper.vw-" + year + " .tip").append("<div class='position'>" + position + suffix + " place</div>");
	  	$(".viz-wrapper.vw-" + year + " .tip").append("<table class='wl-table'><tr class='head'><td>Wins</td><td>Losses</td></tr><tr><td>" + wins + "</td><td>" + losses+ "</td></tr></table>")

	  	// position the tip
	  	// top
	  	var tip_top = $(".viz-wrapper.vw-" + year).offset().top - $(".viz-wrapper.vw-" + year + " .tip").height();
	  	
	  	// left
	  	// determine left side of svg
	  	var svg_left = (window.innerWidth / 2) - (width / 2);
	  	var tip_left = xScale[year](index) - 15;

	  	$(".tip").css({
	  		top: tip_top - 10,
	  		left: tip_left,
	  		border: "2px solid " + colors.filter(c => slugify(d.id) == c.slug)[0].bg
	  	});

	  }

	  // highlight selected
	  function highlight(state_slug){

	  	d3.selectAll(".viz-wrapper.vw-" + year + " .team.unset .line-out")
	  			.style("opacity", ".2");
	  	
	  	d3.selectAll(".viz-wrapper.vw-" + year + " .team.unset .line")
	  		.style("opacity", ".2");

	  	d3.select(".viz-wrapper.vw-" + year + " .line-out." + state_slug)
	  			.style("opacity", stroke_on.opacity)
	  			.style("stroke-width", stroke_on.width + 6);

	  	d3.select(".viz-wrapper.vw-" + year + " .line." + state_slug)
	  			.style("opacity", stroke_on.opacity)
	  			.style("stroke-width", stroke_on.width);
	  	
	  	d3.select(".viz-wrapper.vw-" + year + " .team." + state_slug).moveToFront();

		}

		// FUNCTION WHEN MOUSE OUT OF A TEAM
	  function mouseout(){

	  	// if no teams are set, show them all
	  	if (!$(".team").hasClass("set")){
	  	
		  	d3.selectAll(".viz-wrapper.vw-" + year + " .team.unset .line-out")
		  			.style("opacity", stroke_off.opacity)
		  			.style("stroke-width", stroke_off.width + 4)

		  	d3.selectAll(".viz-wrapper.vw-" + year + " .team.unset .line")
		  			.style("opacity", stroke_off.opacity)
		  			.style("stroke-width", stroke_off.width)

	  	} else {

		  	d3.selectAll(".viz-wrapper.vw-" + year + " .team.unset .line-out")
		  			.style("opacity", ".2")
		  			.style("stroke-width", stroke_off.width + 4)

		  	d3.selectAll(".viz-wrapper.vw-" + year + " .team.unset .line")
		  			.style("opacity", ".2")
		  			.style("stroke-width", stroke_off.width)

		  	d3.select(".viz-wrapper.vw-" + year + " .team.set").moveToFront();

	  	}

	  	$(".viz-wrapper.vw-" + year + " .tip").hide();
	  

	  }
  } // end draw()

  
} // end ready()



// allSeasons(years[0]);



function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
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
