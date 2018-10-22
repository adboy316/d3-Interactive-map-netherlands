
/* References 
D3 Map - Credit to Mike Bostock - https://bost.ocks.org/mike/map/
Bubble Map - Credit to Mike Bostock - https://bost.ocks.org/mike/bubble-map/
Province population Legend - Credit to Visual Cinamon - https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
Donut chart - https://www.visualcinnamon.com/2015/09/placing-text-on-arcs.html
Municipalities Tooltip - Credit to Mike Bostock - https://bl.ocks.org/mbostock/1087001
Bar Graph - Credit to Mike Bostock - https://bost.ocks.org/mike/bar/
*/

// =================
// Data for the entire country
// =================

// Population Data for Netherlands as a whole (I could not get this data to merge into the geojson file for some reason)
  var country_data = '{"total_population": 17181084, "man": 8527041, "woman": 8654043, "5orYounger": 868099, "5to10": 928066, "10to15": 966459, "15to20": 1048032, "20to25": 1068781, "25to45": 4222614, "45to65": 4839917, "65to80": 2460202, "80orOlder": 778914, "unmarried": 8287607, "married": 6710175, "dutchBackground": 13209225, "migrationBackground": 3971859}'
  // Parse above data so that it can be placed in the arrays below
  var country_values = JSON.parse(country_data);

  // Turn JSON data into flat array format, got technique from: https://stackoverflow.com/questions/30808384/d3-bar-chart-from-geojson

  // Number of man and women in the whole country
  var country_data_man_woman = [
                      {name:"Man", value:country_values["man"]},
                      {name:"Women", value:country_values["woman"]},
                    ];
// Number of married vs unmarried people in the whole country
  var country_data_marital = [
                      {name:"Unmarried", value:country_values["unmarried"]},
                      {name:"Married", value:country_values["married"]},
                    ];
// Number of married vs unmarried people in the whole country
  var country_data_background = [
                      {name:"Dutch Background", value:country_values["dutchBackground"]},
                      {name:"Migration Background ", value:country_values["migrationBackground"]},
                    ];
// Population age distribution in the whole country
  var country_data_age = [
                      {name:"5 or Younger", value:country_values["5orYounger"]},
                      {name:"5 to 10", value:country_values["5to10"]},
                      {name:"10 to 15", value:country_values["10to15"]},
                      {name:"15 to 20", value:country_values["15to20"]},
                      {name:"20 to 25", value:country_values["20to25"]},
                      {name:"25 to 45", value:country_values["25to45"]},
                      {name:"45 to 65", value:country_values["45to65"]},
                      {name:"65 to 80", value:country_values["65to80"]},
                      {name:"80 or Older", value:country_values["80orOlder"]},
                    ];

// =================
// Constants:
// =================

// Height and width of the MAP SVG element 
var screenWidth = window.innerWidth;
var svgMargin = {left: 20, top: 40, right: 20, bottom: 0}
    
   width = Math.min(screenWidth, 680) - (svgMargin.left) - svgMargin.right,
    height = Math.min(screenWidth, 750) - (svgMargin.left) - svgMargin.right

//Age distribution bargraph margins and size
var barMargin = {top: 20, right: 30, bottom: 65, left: 40}, //margins in D3 are specified as an object with top, right, bottom and left properties
    barWidth = Math.min(screenWidth, 400) - barMargin.left - barMargin.right,
    barHeight = Math.min(screenWidth, 350) - barMargin.top - barMargin.bottom;
    

// Donut chart margins and size
var pieMargin = {left: 10, top: 120, right: 50, bottom: 10},
    pieWidth = Math.min(screenWidth, 150) - (pieMargin.left) - pieMargin.right,
    pieHeight = Math.min(screenWidth, 150) - (pieMargin.left) - pieMargin.right,
    pieRadius = Math.min(pieWidth, pieHeight) / 2;
    yPositionPie = 90;
    xPositionPie = 20;

    

// =================
// Set up the Map:
// =================

// =================
// Map of the Netherlands:

// Projects spherical coordinates of the Cartesian plate. Needed to display map on 2d plane. 
var projection = d3.geoMercator()
                   .center([ 5.4, 52.2 ])
                   .translate([ width/2, height/2 ])
                   //change size of map within SVG element
                   .scale([ width*12.5]);

// Path generator takes projection and formats it for SVG   
var path = d3.geoPath()
            .projection(projection);

// Create main SVG element where all content will be inserted
var svgMain = d3.select("body").append("svg")
            .attr("width", (width + svgMargin.left + barMargin.left) + (svgMargin.right + barMargin.right +400))
            .attr("height", height + svgMargin.top + svgMargin.bottom)
            .attr("class", "mainSvg")

// Create g element where map will be inserted 
var svgMap = svgMain.append("g")
            .attr("width", (width + svgMargin.left + barMargin.left) + (svgMargin.right + barMargin.right +400))
            .attr("height", height + svgMargin.top + svgMargin.bottom)
            .attr("class", "map")
            .attr("transform", "translate(" + (width-200) + "," + (-40) + ")");
        

// Color scale for population of province
var color = d3.scaleSequential()
    .domain([.37e6, 3.8e6])
   .interpolator(d3.interpolateOranges);

// Scale for radius of circles based on population of municipality 
var radius = d3.scaleSqrt()
    .domain([1, 1e6])
    .range([0, 25]);

// Load the geojson map file, which also contains population data for provinces and municipalities 
d3.json("nl.json", function(error, nl) {


// =================
// Create provinces and municipalities in map:

// Create a child element that will contain each municipality
  svgMap.append("g")
    .attr("class", "municipalities")
    .selectAll(".path")
    .data(topojson.feature(nl, nl.objects.municipalities).features)
    .enter().append("path")
      .attr("class", function(d) { return "municipalities " + d.properties.id; })
        .attr("d", path);  
         
// Create a child element that will contain each province
  svgMap.append("g")
    .attr("class", "provinces")
    .selectAll(".path")
    .data(topojson.feature(nl, nl.objects.provinces).features)
    // Create a child SVG for each province 
    .enter().append("path")
    .attr("fill", function(d) { return color(d.properties.total_population); })
    .attr("d", path)
    .on("mouseover", handleProviMouseOver)
    .on("mouseout", handleProviMouseOut);

  // =================
  // Create white line boundaries between provinces
  svgMap.append("path")
    .attr("class", "province-boundaries")
    .datum(topojson.feature(nl, nl.objects.provinces, function(a, b) { return a !== b; }))
    .attr("d", path);


// =================
// Bubbles, charts, legends and labels:
// =================

  // =================
  // Place a bubble elment at each municipality centroid
  svgMap.append("g")
    .attr("class", "bubble")
    .selectAll("circle")
      .data(topojson.feature(nl, nl.objects.municipalities).features
        .sort(function(a, b) { return b.properties.total_population - a.properties.total_population; }))
    .enter().append("circle")  
      .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
      .attr("r", function(d) { return radius(d.properties.total_population); })
    .on("mouseover", handleMuniMouseOver)
    .on("mouseout", handleMuniMouseOut);


  // Place a legend for the popupultion bubbles
  var legend = svgMap.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - 520) + "," + (height - 510) + ")")
    .selectAll("g")
    .data([.1e6, .5e6, 1e6])
    .enter().append("g");

  legend.append("circle")
      .attr("cy", function(d) { return -radius(d); })
      .attr("r", radius);

  legend.append("text")
      .attr("y", function(d) { return -2 * radius(d); })
      .attr("dy", "1.3em")
      .text(d3.format(".1s")); 

  // =================
  // Age distribution bargraph:           

  // Create a band scale that returns the width of each bar - https://github.com/d3/d3-scale/blob/master/README.md#band_bandwidth
  var x = d3.scaleBand()
  		.range([0, barWidth])
  		.padding(.1); // adds padding between bars
     
  // Create a linear scale that returns the height of each bar - https://github.com/d3/d3-scale#linear-scales
  var y = d3.scaleLinear()
      .range([barHeight, 0]);

  // Add x and y axis
  var xAxis = d3.axisBottom(x)

  var yAxis = d3.axisLeft(y)
  .ticks(10, "s");
		
  // set the width and height of the SVG element to the outer dimensions 
  // and add a g element to offset the origin of the chart area by the top-left margin
  var chart = svgMain.append("g")
      .attr("width", barWidth + barMargin.left + barMargin.right)
      .attr("height", barHeight + barMargin.top + barMargin.bottom)
      .attr("id", "chart")
       .attr("transform", "translate(" + (50) + "," + 230 + ")")
      .append("g")
  	   .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

  x.domain(country_data_age.map(function(d) { return d.name; }));
  y.domain([0, d3.max(country_data_age , function(d) { return d.value; })]);

  // Select all g elements, then use the enter() selection to create an element for each data point
  // this also translates each g element - https://github.com/d3/d3-selection#selection_enter
	xChart = chart.append("g")
	  .attr("class", "x baraxis")
	  .attr("transform", "translate(0," + barHeight + ")")
	  .call(xAxis);

	yChart = chart.append("g")
	  .attr("class", "y baraxis")
	  .call(yAxis);

var barChart =	chart.selectAll(".bar")
	  .data(country_data_age)
	.enter().append("rect")
	  .attr("class", "bar")
	  .attr("x", function(d) { return x(d.name); })
	  .attr("y", function(d) { return y(d.value); })
	  .attr("height", function(d) { return barHeight - y(d.value); })
	  .attr("width", x.bandwidth());

  // Rotate text on x axis -  http://bl.ocks.org/phoebebright/3061203
  chart.selectAll(".x.baraxis text")  // select all the text elements for the xaxis
    .attr("transform", function(d) {
       return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().width/2 + ")rotate(-45)";
   });

  // now add titles to the axes
    chart.append("text")
      .attr("text-anchor", "middle")  
      .attr("transform", "translate("+ (barMargin.left -100) +","+(barHeight/2)+")rotate(-90)")  
      .text("Population of Age Group");

       chart.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (barWidth/2) +","+(barHeight-(barMargin.bottom - 120))+")")  // centre below axis
      .text("Age Group");

  // =================
  // Donut chart for gender population: - https://www.visualcinnamon.com/2015/09/placing-text-on-arcs.html

  var pieSvg = svgMain.append("g")
      .attr("width", (pieWidth + pieMargin.left + pieMargin.right))
  	 .attr("height", (pieHeight + pieMargin.top + pieMargin.bottom))
     .attr("class", "piechart")
     .attr("transform", "translate(" + xPositionPie + "," + yPositionPie + ")")
     .append("g").attr("class", "wrapper")
  	.attr("transform", "translate(" + (pieWidth / 2 + pieMargin.left ) + "," + (pieHeight / 2 + pieMargin.bottom) + ")");

  // Create a color scale
  var pieColor  = d3.scaleOrdinal(d3.schemeCategory20c);

  var arc = d3.arc()
      .innerRadius(pieWidth*0.75/2) 
  	   .outerRadius(pieWidth*0.75/2 + 30);
    
   //Turn the pie chart 90 degrees counter clockwise, so it starts at the left	
  var pie = d3.pie()
  	.startAngle(-90 * Math.PI/180) 
  	.endAngle(-90 * Math.PI/180 + 2*Math.PI)
  	.value(function(d) { return d.value; })
  	.padAngle(.01)
  	.sort(null);

// Create Donut Chart

  arcs = pieSvg.selectAll(".donutArcSlices")
  			.data(pie(country_data_man_woman))
  		  .enter().append("path")
  			.attr("class", "donutArcSlices")
  			.attr("d", arc)
  			.style("fill", function(d,i) {
  				if(i === 7) return "#CCCCCC"; //Other
  				else return pieColor(i); 
  			})
  			.each(function(d, i) {

  				//A regular expression that captures all in between the start of a string (denoted by ^) and a capital letter L
  				//The letter L denotes the start of a line segment
  				//The "all in between" is denoted by the .+? 
  				//where the . is a regular expression for "match any single character except the newline character"
  				//the + means "match the preceding expression 1 or more times" (thus any single character 1 or more times)
  				//the ? has to be added to make sure that it stops at the first L it finds, not the last L 
  				//It thus makes sure that the idea of ^.*L matches the fewest possible characters
  				//For more information on regular expressions see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  				var firstArcSection = /(^.+?)L/; 
  					
  				//Grab everything up to the first Line statement
  				//The [1] gives back the expression between the () (thus not the L as well) which is exactly the arc statement
  				var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
  				//Replace all the comma's so that IE can handle it -_-
  				//The g after the / is a modifier that "find all matches rather than stopping after the first match"
  				newArc = newArc.replace(/,/g , " ");
  							
  	//If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
  			//flip the end and start position
  			if (d.endAngle > 90 * Math.PI/180) {
  				var startLoc 	= /M(.*?)A/,		//Everything between the first capital M and first capital A
  					middleLoc 	= /A(.*?)0 [01] 1/,	//Everything between the first capital A and 0 0 1
  					endLoc 		= /0 [01] 1 (.*?)$/;	//Everything between the first 0 0 1 and the end of the string (denoted by $)
  				//Flip the direction of the arc by switching the start en end point (and sweep flag)
  				//of those elements that are below the horizontal line
  				var newStart = endLoc.exec( newArc )[1];
  				var newEnd = startLoc.exec( newArc )[1];
  				var middleSec = middleLoc.exec( newArc )[1];
  				
  				//Build up the new arc notation, set the sweep-flag to 0
  				newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
  			}//if

  				//Create a new invisible arc that the text can flow along
  				pieSvg.append("path")
  					.attr("class", "hiddenDonutArcs")
  					.attr("id", "donutArc"+i)
  					.attr("d", newArc)
  					.style("fill", "none");
  			});
  			
  		//Append the label names on the outside
  	arctext =	pieSvg.selectAll(".donutText")
  			.data(pie(country_data_man_woman))
  		   .enter().append("text")
      .attr("class", "donutText")
      //Move the labels below the arcs for slices with an end angle > than 90 degrees
      .attr("dy", function(d,i) {
          return (d.endAngle > 90 * Math.PI/180 ? 18 : -11);
      })
      .append("textPath")
      .attr("startOffset","50%")
      .style("text-anchor","middle")
      .attr("xlink:href",function(d,i){return "#donutArc"+i;})
      .text(function(d){return d.data.name + ": " + d.data.value;});

    // =================
  // Donut chart for marital status: 

  var pieSvg2 = svgMain.append("g")
      .attr("width", (pieWidth + pieMargin.left + pieMargin.right))
     .attr("height", (pieHeight + pieMargin.top + pieMargin.bottom))
     .attr("class", "piechart")
     .attr("transform", "translate(" + (xPositionPie*9.5) + "," + yPositionPie + ")")
     .append("g").attr("class", "wrapper")
    .attr("transform", "translate(" + (pieWidth / 2 + pieMargin.left ) + "," + (pieHeight / 2 + pieMargin.bottom) + ")");

  // Create a color scale
  var pieColor2  = d3.scaleOrdinal(d3.schemeCategory20c);

  var arc2 = d3.arc()
      .innerRadius(pieWidth*0.75/2) 
       .outerRadius(pieWidth*0.75/2 + 30);
    
   //Turn the pie chart 90 degrees counter clockwise, so it starts at the left  
  var pie2 = d3.pie()
    .startAngle(-90 * Math.PI/180) 
    .endAngle(-90 * Math.PI/180 + 2*Math.PI)
    .value(function(d) { return d.value; })
    .padAngle(.01)
    .sort(null);

// Create Donut Chart

  arcs2 = pieSvg2.selectAll(".donutArcSlices")
        .data(pie2(country_data_marital))
        .enter().append("path")
        .attr("class", "donutArcSlices")
        .attr("d", arc)
        .style("fill", function(d,i) {
          if(i === 7) return "#CCCCCC"; //Other
          else return pieColor(i); 
        })
        .each(function(d, i) {

          var firstArcSection = /(^.+?)L/; 
            
          //Grab everything up to the first Line statement
          //The [1] gives back the expression between the () (thus not the L as well) which is exactly the arc statement
          var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
          //Replace all the comma's so that IE can handle it -_-
          //The g after the / is a modifier that "find all matches rather than stopping after the first match"
          newArc = newArc.replace(/,/g , " ");
                
    //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
        //flip the end and start position
        if (d.endAngle > 90 * Math.PI/180) {
          var startLoc  = /M(.*?)A/,    //Everything between the first capital M and first capital A
            middleLoc   = /A(.*?)0 [01] 1/, //Everything between the first capital A and 0 0 1
            endLoc    = /0 [01] 1 (.*?)$/;  //Everything between the first 0 0 1 and the end of the string (denoted by $)
          //Flip the direction of the arc by switching the start en end point (and sweep flag)
          //of those elements that are below the horizontal line
          var newStart = endLoc.exec( newArc )[1];
          var newEnd = startLoc.exec( newArc )[1];
          var middleSec = middleLoc.exec( newArc )[1];
          
          //Build up the new arc notation, set the sweep-flag to 0
          newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
        }//if

          //Create a new invisible arc that the text can flow along
          pieSvg2.append("path")
            .attr("class", "hiddenDonutArcs")
            .attr("id", "donutArc"+i)
            .attr("d", newArc)
            .style("fill", "none");
        });
        
      //Append the label names on the outside
    arctext2 = pieSvg2.selectAll(".donutText")
        .data(pie2(country_data_marital))
         .enter().append("text")
      .attr("class", "donutText")
      //Move the labels below the arcs for slices with an end angle > than 90 degrees
      .attr("dy", function(d,i) {
          return (d.endAngle > 180 * Math.PI/180 ? 18 : -11);
      })
      .append("textPath")
      .attr("startOffset","50%")
      .style("text-anchor","middle")
      .attr("xlink:href",function(d,i){return "#donutArc"+i;})
      .text(function(d){return d.data.name + ": " + d.data.value;});


   // =================
  // Donut chart for background: 

  var pieSvg3 = svgMain.append("g")
      .attr("width", (pieWidth + pieMargin.left + pieMargin.right))
     .attr("height", (pieHeight + pieMargin.top + pieMargin.bottom))
     .attr("class", "piechart")
     .attr("transform", "translate(" + (xPositionPie*18) + "," + yPositionPie + ")")
     .append("g").attr("class", "wrapper")
    .attr("transform", "translate(" + (pieWidth / 2 + pieMargin.left ) + "," + (pieHeight / 2 + pieMargin.bottom) + ")");

  // Create a color scale
  var pieColor3  = d3.scaleOrdinal(d3.schemeCategory20c);

  var arc3 = d3.arc()
      .innerRadius(pieWidth*0.75/2) 
       .outerRadius(pieWidth*0.75/2 + 30);
    
   //Turn the pie chart 90 degrees counter clockwise, so it starts at the left  
  var pie3 = d3.pie()
    .startAngle(-180 * Math.PI/180) 
    .endAngle(-90 * Math.PI/180 + 2*Math.PI)
    .value(function(d) { return d.value; })
    .padAngle(.01)
    .sort(null);

// Create Donut Chart for migration background

  arcs3 = pieSvg3.selectAll(".donutArcSlices")
        .data(pie3(country_data_background))
        .enter().append("path")
        .attr("class", "donutArcSlices")
        .attr("d", arc)
        .style("fill", function(d,i) {
          if(i === 7) return "#CCCCCC"; //Other
          else return pieColor(i); 
        })
        .each(function(d, i) {

          var firstArcSection = /(^.+?)L/; 
            
          //Grab everything up to the first Line statement
          //The [1] gives back the expression between the () (thus not the L as well) which is exactly the arc statement
          var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
          //Replace all the comma's so that IE can handle it -_-
          //The g after the / is a modifier that "find all matches rather than stopping after the first match"
          newArc = newArc.replace(/,/g , " ");
                
    //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
        //flip the end and start position
        if (d.endAngle > 90 * Math.PI/180) {
          var startLoc  = /M(.*?)A/,    //Everything between the first capital M and first capital A
            middleLoc   = /A(.*?)0 [01] 1/, //Everything between the first capital A and 0 0 1
            endLoc    = /0 [01] 1 (.*?)$/;  //Everything between the first 0 0 1 and the end of the string (denoted by $)
          //Flip the direction of the arc by switching the start en end point (and sweep flag)
          //of those elements that are below the horizontal line
          var newStart = endLoc.exec( newArc )[1];
          var newEnd = startLoc.exec( newArc )[1];
          var middleSec = middleLoc.exec( newArc )[1];
          
          //Build up the new arc notation, set the sweep-flag to 0
          newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
        }//if

          //Create a new invisible arc that the text can flow along
          pieSvg3.append("path")
            .attr("class", "hiddenDonutArcs")
            .attr("id", "donutArc"+i)
            .attr("d", newArc)
            .style("fill", "none");
        });
        
      //Append the label names on the outside
    arctext3 = pieSvg3.selectAll(".donutText")
        .data(pie3(country_data_background))
         .enter().append("text")
      .attr("class", "donutText")
      //Move the labels below the arcs for slices with an end angle > than 90 degrees
      .attr("dy", function(d,i) {
            return (d.endAngle > 160 * Math.PI/180 ? 18 : -11);
        
      })
      .append("textPath")
      .attr("startOffset","50%")
      .style("text-anchor","middle")
      .attr("xlink:href",function(d,i){return "#donutArc"+i;})
      .text(function(d){return d.data.name + ": " + d.data.value;});


  // =================
  // Color scale legend  based on population of province

  //Append a defs (for definition) element to SVG
    var defs = svgMap.append("defs");
    //Extra scale since the color scale is interpolated
    var countScale = d3.scaleLinear()
      .domain([0, 4e6])
      .range([0, width])
    //Calculate the variables for the temp gradient
    var numStops = 9;
    countRange = countScale.domain();
    countRange[2] = countRange[1] - countRange[0];
    countPoint = [];
    for(var i = 0; i < numStops; i++) {
      countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
    }
    //Create the gradient
    svgMap.append("defs")
      .append("linearGradient")
      .attr("id", "legend-traffic")
      //Sets the direction of the legend
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%")
      .selectAll("stop") 
      .data(d3.range(numStops))                
      .enter().append("stop") 
      .attr("offset", function(d,i) { 
        return countScale( countPoint[i] )/width;
      })   
      .attr("stop-color", function(d,i) { 
        return color( countPoint[i] ); 
      });

    // Draw legend 
    var legendWidth = Math.min(width*0.8, 400);
    //Color legend container
    var legendsvg = svgMap.append("g")
      .attr("class", "legendWrapper")
      // Sets the actual position of the legend  container
      .attr("transform", "translate(" + (width/2) + "," + 720 + ")");
    //Draw the Rectangle
    legendsvg.append("rect")
      .attr("class", "legendRect")
      .attr("x", -legendWidth/2)
      .attr("y", 0)
      .attr("width", legendWidth)
      //sets height of legend
      .attr("height", 10)
      .style("fill", "url(#legend-traffic)");
    //Append title
    legendsvg.append("text")
      .attr("class", "legendTitle")
      .attr("x", 0)
      .attr("y", -5)
      .style("text-anchor", "middle")
      .text("Population of the Netherlands");

  //Set scale for x-axis
  var xScale = d3.scaleLinear()
    .range([-legendWidth/2, legendWidth/2])
    .domain([ 0, 4e6] );
  //Define x-axis
  var xAxis = d3.axisBottom()
    //Set tick number and format
    .ticks(6, "s")
    .scale(xScale);
  //Set up X axis
  legendsvg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (10) + ")")
    .call(xAxis);

	
  // =================
  // Tooltip for displaying municipality and province name on hover 
    var tooltip = d3.select("body").append("div") 
            .attr("class", "tooltip")       
            .style("opacity", 0);


  // =================
  // Name of place and total population

     var textboxPositionX = 20
        textboxPositionY = 10

   var placeName = svgMain.append("text")
        .attr("class", "place-name")
        .attr("x", textboxPositionX)
        .attr("y", textboxPositionY)
        .attr("dy", ".35em")
        .text("Area: The Netherlands");

   var totalPopulation = svgMain.append("text")
        .attr("class", "population-text")
        .attr("x", textboxPositionX )
        .attr("y", textboxPositionY + 30)
        .attr("dy", ".35em")
        .text("Total Population: 17181084");
      
  

   
// =================
// Handlers:
// =================

// Changes the graphs and titles every time a user hovers over a province with the corresponsing province data
function handleProviMouseOver(d) {

  d3.select(this)
    .attr("class", "proviMouseOver")

// Display the name of the province as a tooltip
  tooltip.transition()    
    .duration(200)    
    .style("opacity", .9);    
    tooltip.html(d.properties.province_name) 
    .style("left", (d3.event.pageX) + "px")   
    .style("top", (d3.event.pageY - 28) + "px");  

  // Edit textbox with information about the province   
  placeName.html("Area: " + d.properties.province_name) 
  totalPopulation.html("Total Population: " + d.properties.total_population) 

  // Prepare province data for bar chart
 var province_data_man_woman = [
                      {name:"Man", value:d.properties["man"]},
                      {name:"Women", value:d.properties["woman"]},
                    ];

  var province_data_marital = [
                      {name:"Unmarried", value:d.properties["unmarried"]},
                      {name:"Married", value:d.properties["married"]},
                    ];

  var province_data_background = [
                      {name:"Dutch Background", value:d.properties["dutchBackground"]},
                      {name:"Migration Background", value:d.properties["migrationBackground"]},
                    ];

  var province_data_age = [
              {name:"5 or Younger", value:d.properties["5orYounger"]},
              {name:"5 to 10", value:d.properties["5to10"]},
              {name:"10 to 15", value:d.properties["10to15"]},
              {name:"15 to 20", value:d.properties["15to20"]},
              {name:"20 to 25", value:d.properties["20to25"]},
              {name:"25 to 45", value:d.properties["25to45"]},
              {name:"45 to 65", value:d.properties["45to65"]},
              {name:"65 to 80", value:d.properties["65to80"]},
              {name:"80 or Older", value:d.properties["80orOlder"]}
              ];

//Update the barchart with province data
  x.domain(province_data_age.map(function(d) { return d.name; }));
  y.domain([0, d3.max(province_data_age , function(d) { return d.value; })]);
  barChart.data(province_data_age)
  barChart.attr("y", function(d) { return y(d.value); })
  barChart.attr("x", function(d) { return x(d.name); })
  barChart.attr("height", function(d) { return barHeight - y(d.value); })
  barChart.attr("width", x.bandwidth())
  yChart.attr("class", "y baraxis")
  yChart.call(yAxis);

// Update donut chart with province data
 	arcs = arcs.data(pie(province_data_man_woman));
  arcs.attr("d", arc)
  arctext.data(province_data_man_woman)
  arctext.text(function(d){return d.name + ": " + d.value;});

arcs2 = arcs2.data(pie(province_data_marital));
  arcs2.attr("d", arc)
  arctext2.data(province_data_marital)
  arctext2.text(function(d){return d.name + ": " + d.value;});

  arcs3 = arcs3.data(pie(province_data_background));
  arcs3.attr("d", arc)
  arctext3.data(province_data_background)
  arctext3.text(function(d){return d.name + ": " + d.value;});
  }

// Changes the graphs and titles every time a user hovers out of a province with the corresponsing country data
function handleProviMouseOut(d) {

  d3.select(this)
    .attr("class", "proviMouseOut")

  // Remove province text on mouse out
  tooltip.transition()    
    .duration(500)    
    .style("opacity", 0); 

  // Update textbox on mouseout
   placeName.text("Area: The Netherlands");
   totalPopulation.text("Total Population: 17,181,084");

  //Update barchart with country data on mouseout
  x.domain(country_data_age.map(function(d) { return d.name; }));
  y.domain([0, d3.max(country_data_age , function(d) { return d.value; })]);
  barChart.data(country_data_age)
  barChart.attr("y", function(d) { return y(d.value); })
  barChart.attr("x", function(d) { return x(d.name); })
  barChart.attr("height", function(d) { return barHeight - y(d.value); })
  barChart.attr("width", x.bandwidth())
  yChart.attr("class", "y baraxis")
  yChart.call(yAxis);

	// Update donut chart with country data on mouseout
	 
 	arcs = arcs.data(pie(country_data_man_woman));
    arcs.attr("d", arc)
    arctext.data(country_data_man_woman)
    arctext.text(function(d){return d.name + ": " + d.value;});

       arcs2 = arcs2.data(pie(country_data_marital));
    arcs2.attr("d", arc)
    arctext2.data(country_data_marital)
    arctext2.text(function(d){return d.name + ": " + d.value;});

    arcs3 = arcs3.data(pie(country_data_background));
    arcs3.attr("d", arc)
    arctext3.data(country_data_background)
    arctext3.text(function(d){return d.name + ": " + d.value;});

}
  

// Changes the graphs and titles every time a user hovers over a province with the corresponsing province data
function handleMuniMouseOver(d) {  // Add interactivity

  // Use D3 to select element, change color and size
 d3.select(this)
  .attr("class", "bubbleMuniMouseOver")

  tooltip.transition()    
      .duration(200)    
      .style("opacity", .9);    
      tooltip.html(d.properties.municipality_name) 
      .style("left", (d3.event.pageX) + "px")   
      .style("top", (d3.event.pageY - 28) + "px");  
      
  // Edit textbox with information about the municipality
  placeName.html("Area: " + d.properties.municipality_name) 
  totalPopulation.html("Total Population: " + d.properties.total_population) 
  // Prepare municipality data for bar chart
 var municipality_data_man_woman = [
                      {name:"Man", value:d.properties["man"]},
                      {name:"Women", value:d.properties["woman"]},
                    ];

  var municipality_data_marital = [
                      {name:"Unmarried", value:d.properties["unmarried"]},
                      {name:"Married", value:d.properties["married"]},
                    ];

  var municipality_data_background = [
                      {name:"Dutch Background", value:d.properties["dutchBackground"]},
                      {name:"Migration Background", value:d.properties["migrationBackground"]},
                    ];

  var municipality_data_age = [
              {name:"5 or Younger", value:d.properties["5orYounger"]},
              {name:"5 to 10", value:d.properties["5to10"]},
              {name:"10 to 15", value:d.properties["10to15"]},
              {name:"15 to 20", value:d.properties["15to20"]},
              {name:"20 to 25", value:d.properties["20to25"]},
              {name:"25 to 45", value:d.properties["25to45"]},
              {name:"45 to 65", value:d.properties["45to65"]},
              {name:"65 to 80", value:d.properties["65to80"]},
              {name:"80 or Older", value:d.properties["80orOlder"]}
              ];

    //Update barchart with municipality data on mouseover
    x.domain(municipality_data_age.map(function(d) { return d.name; }));
    y.domain([0, d3.max(municipality_data_age , function(d) { return d.value; })]);
    barChart.data(municipality_data_age)
    barChart.attr("y", function(d) { return y(d.value); })
    barChart.attr("x", function(d) { return x(d.name); })
    barChart.attr("height", function(d) { return barHeight - y(d.value); })
    barChart.attr("width", x.bandwidth())
    yChart.attr("class", "y baraxis")
    yChart.call(yAxis);

    // Update donut chart with municipality data on mouseout
    arcs = arcs.data(pie(municipality_data_man_woman));
    arcs.attr("d", arc)
    arctext.data(municipality_data_man_woman)
    arctext.text(function(d){return d.name + ": " + d.value;});

    arcs2 = arcs2.data(pie(municipality_data_marital));
    arcs2.attr("d", arc)
    arctext2.data(municipality_data_marital)
    arctext2.text(function(d){return d.name + ": " + d.value;});

    arcs3 = arcs3.data(pie(municipality_data_background ));
    arcs3.attr("d", arc)
    arctext3.data(municipality_data_background )
    arctext3.text(function(d){return d.name + ": " + d.value;});

      }
  
// Changes the graphs and titles every time a user hovers out of a municipality with the corresponsing province data
function handleMuniMouseOut(d) {
  // Use D3 to select element, change color back to normal
  d3.select(this) 
    .attr("class", "bubble")

    // Remove municipality text on mouse out
    tooltip.transition()    
      .duration(500)    
      .style("opacity", 0); 

  // Update textbox on mouseout
   placeName.text("Area: The Netherlands");
   totalPopulation.text("Total Population: 17,181,084");

      //Update barchart with country data on mouseout
  x.domain(country_data_age.map(function(d) { return d.name; }));
  y.domain([0, d3.max(country_data_age , function(d) { return d.value; })]);
  barChart.data(country_data_age)
  barChart.attr("y", function(d) { return y(d.value); })
  barChart.attr("x", function(d) { return x(d.name); })
  barChart.attr("height", function(d) { return barHeight - y(d.value); })
  barChart.attr("width", x.bandwidth())
  yChart.attr("class", "y baraxis")
  yChart.call(yAxis);

  // Update donut chart with country data on mouseout
   
  arcs = arcs.data(pie(country_data_man_woman));
    arcs.attr("d", arc)
    arctext.data(country_data_man_woman)
    arctext.text(function(d){return d.name + ": " + d.value;});

    arcs2 = arcs2.data(pie(country_data_marital));
    arcs2.attr("d", arc)
    arctext2.data(country_data_marital)
    arctext2.text(function(d){return d.name + ": " + d.value;});

    arcs3 = arcs3.data(pie(country_data_background));
    arcs3.attr("d", arc)
    arctext3.data(country_data_background)
    arctext3.text(function(d){return d.name + ": " + d.value;});
  }

  // For viewing file objects, REMEMBER TO DELETE 
  console.log(nl);

});

