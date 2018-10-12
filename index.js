
/* References 
D3 Map - Credit to Mike Bostock - https://bost.ocks.org/mike/map/
Bubble Map - Credit to Mike Bostock - https://bost.ocks.org/mike/bubble-map/
Province population Legend - Credit to Visual Cinamon - https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
Municipalities Tooltip - Credit to Mike Bostock - https://bl.ocks.org/mbostock/1087001
Bar Graph - Credit to Mike Bostock - https://bost.ocks.org/mike/bar/
*/

// Height and width of the MAP SVG element 
var width = 580,
	 height = 650;

// Projects spherical coordinates of the Cartesian plate. Needed to display map on 2d plane. 
var projection = d3.geoMercator()
                   .center([ 5.4, 52.2 ])
                   .translate([ width/2, height/2 ])
                   //change size of map within SVG element
                   .scale([ width*12.5]);

// Path generator takes above projection and formats it for SVG   
var path = d3.geoPath()
            .projection(projection);

// Create SVG element where map will be inserted 
var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

// Color scale for population of province
var color = d3.scaleSequential()
    .domain([.37e6, 3.8e6])
   .interpolator(d3.interpolateOranges);

// Scale for radius of circles based on population of municipality 
var radius = d3.scaleSqrt()
    .domain([1, 1e6])
    .range([0, 25]);


// d3.json is asynchronous, the rest of the page will render while it waits for the topojson file
// This loads the geojson map file, which also contains population data for provinces and municipalities 
d3.json("nl.json", function(error, nl) {

///////////////////////////////////////////////////////////////////////////
//////////////////// Create Graphs for Country Data ///////////////////
///////////////////////////////////////////////////////////////////////////	

  // Population Data for Netherlands as a whole (I could not get this data to merge into the geojson file for some reason)
  var country_data = '{"total_population": 17181084, "man": 8527041, "woman": 8654043, "5orYounger": 868099, "5to10": 928066, "10to15": 966459, "15to20": 1048032, "20to25": 1068781, "25to45": 4222614, "45to65": 4839917, "65to80": 2460202, "80orOlder": 778914, "unmarried": 8287607, "married": 6710175, "dutchBackground": 13209225, "migrationBackground": 3971859}'
  // Parse above data so that it can be placed in the arrays below
  var country_values = JSON.parse(country_data);

  // Turn JSON data into flat array format, got technique from: https://stackoverflow.com/questions/30808384/d3-bar-chart-from-geojson
  // There should be a more efficient way to do this, but I had trouble finding a better solution. 

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
                      {name:"Migration Background", value:country_values["migrationBackground"]},
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

  console.log(country_data_age);             

  //Age distribution bargraph width, height, margin
  var 	barMargin = {top: 20, right: 30, bottom: 65, left: 60}, //margins in D3 are specified as an object with top, right, bottom and left properties
  		barWidth = 400 - barMargin.left - barMargin.right,
      	barHeight = 350 - barMargin.top - barMargin.bottom;

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
      var chart = d3.select(".chart")
          .attr("width", barWidth + barMargin.left + barMargin.right)
          .attr("height", barHeight + barMargin.top + barMargin.bottom)
          .append("g")
    		.attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

	 x.domain(country_data_age.map(function(d) { return d.name; }));
	 y.domain([0, d3.max(country_data_age , function(d) { return d.value; })]);

	// Select all g elements, then use the enter() selection to create an element for each data point
	// this also translates each g element - https://github.com/d3/d3-selection#selection_enter
		chart.append("g")
		  .attr("class", "x baraxis")
		  .attr("transform", "translate(0," + barHeight + ")")
		  .call(xAxis);

		chart.append("g")
		  .attr("class", "y baraxis")
		  .call(yAxis);

		chart.selectAll(".bar")
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

//////////////////////////////////////////////////////////////////////////
/////////////Create country donut chart for gender//////////////////
////////////////////////////////////////////////////////////////////////// 

var pieWidth = 460,
pieHeight = 300,
pieRadius = Math.min(pieWidth, pieHeight) / 2;

var pieColor  = d3.scaleOrdinal(d3.schemeCategory20c);
  
var pie = d3.pie()
.value(function(d) { return d.value; });

var arc = d3.arc()
    .innerRadius(pieRadius - 100)
    .outerRadius(pieRadius - 80);

var pieSvg = d3.select(".piechart")
    .attr("width", pieWidth)
    .attr("height", pieHeight)
  .append("g")
    .attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");

var arcs = pieSvg.selectAll(".pieArc")
      .data(pie(country_data_man_woman))
    .enter().append("path")
      .attr("fill", function(d, i) { return pieColor(i); })
      .attr("d", "M 10,90 Q 100,15 200,70 Q 340,140 400,30")
      .attr("class", "pieArc")
      .attr("id", function(d,i) { return "arcid_"+i; })
      .attr("d", arc);


var arctext =  pieSvg.selectAll(".arcText")
    .data(country_data_man_woman)
    .enter().append("text")
    .attr("class", "arcText")
    .append("textPath")
    .attr("xlink:href",function(d,i){return "#arcid_"+i;})
    .text(function(d){return d.value;});


	




//////////////////////////////////////////////////////////////////////////
/////////////Create provicnes and municipalities of map //////////////////
////////////////////////////////////////////////////////////////////////// 

	// Create a child element that will contain each municipality
	svg.append("g")
	  .attr("class", "municipalities")
	  .selectAll(".path")
	  .data(topojson.feature(nl, nl.objects.municipalities).features)
	  .enter().append("path")
	    .attr("class", function(d) { return "municipalities " + d.properties.id; })
	      .attr("d", path);  
	       
	// Create a child element that will contain each province
	  svg.append("g")
	    .attr("class", "provinces")
	    .selectAll(".path")
	    .data(topojson.feature(nl, nl.objects.provinces).features)
	    // Create a child SVG for each province 
	    .enter().append("path")
	   	.attr("fill", function(d) { return color(d.properties.total_population); })
	    .attr("d", path)
	    .on("mouseover", handleProviMouseOver)
	    .on("mouseout", handleProviMouseOut);



  // Tooltip for displaying municipality and province name on hover
  var tooltip = d3.select("body").append("div") 
          .attr("class", "tooltip")       
          .style("opacity", 0);


    function handleProviMouseOver(d) {

      d3.select(this)
        .attr("class", "proviMouseOver")


      tooltip.transition()    
        .duration(200)    
        .style("opacity", .9);    
        tooltip.html(d.properties.province_name) 
        .style("left", (d3.event.pageX) + "px")   
        .style("top", (d3.event.pageY - 28) + "px");  
        
      // Create textbox     
      var string = "<p>Total Population</strong>: " + d.properties.total_population + "</p>";
      string += "<p><strong>% population</strong>: " + d.properties.total_population + "%</p>";

      d3.select("#textbox")
        .html("")
        .append("text")
        .html(string);

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

      //This section removes the existing bar chart displaying the country data and creates a new bar chart with the province data
      //It's the same bar graph as above with new data and a function that removes the old rects and texts 

	   x.domain(province_data_age.map(function(d) { return d.name; }));
	 	y.domain([0, d3.max(province_data_age , function(d) { return d.value; })]);

      chart.selectAll(".bar")
      .remove()

       chart.selectAll(".y.baraxis")
      .remove()      

		chart.append("g")
		  .attr("class", "y baraxis")
		  .call(yAxis);

		chart.selectAll(".bar")
		  .data(province_data_age)
		.enter().append("rect")
		  .attr("class", "bar")
		  .attr("x", function(d) { return x(d.name); })
		  .attr("y", function(d) { return y(d.value); })
		  .attr("height", function(d) { return barHeight - y(d.value); })
		  .attr("width", x.bandwidth());

	 /////////////PIE CHART///////////////
   
 	arcs = arcs.data(pie(province_data_man_woman));
    arcs.attr("d", arc)
    arctext.data(province_data_man_woman)
    arctext.text(function(d){return d.value;});
  








	 ///////// END PIE CHART////////

    }


    function handleProviMouseOut(d) {

      d3.select(this)
        .attr("class", "proviMouseOut")

      // Remove province text on mouse out
      tooltip.transition()    
        .duration(500)    
        .style("opacity", 0); 

        //removes the existing bar chart displaying the province data and creates a new bar chart with the province data

       x.domain(country_data_age.map(function(d) { return d.name; }));
	 	y.domain([0, d3.max(country_data_age , function(d) { return d.value; })]);

	      chart.selectAll(".bar")
	      .remove()

	       chart.selectAll(".y.baraxis")
	      	.remove()      

			chart.append("g")
			  .attr("class", "y baraxis")
			  .call(yAxis);

			chart.selectAll(".bar")
			  .data(country_data_age)
			.enter().append("rect")
			  .attr("class", "bar")
			  .attr("x", function(d) { return x(d.name); })
			  .attr("y", function(d) { return y(d.value); })
			  .attr("height", function(d) { return barHeight - y(d.value); })
			  .attr("width", x.bandwidth());

	/////////////PIE CHART///////////////
	 
 	arcs = arcs.data(pie(country_data_man_woman));
    arcs.attr("d", arc)
    arctext.data(country_data_man_woman)
    arctext.text(function(d){return d.value;});


 /////////////PIE CHART///////////////

    }
  

// Place a bubble elment at each municipality centroid
svg.append("g")
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
  var legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(" + (width - 50) + "," + (height - 20) + ")")
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



 // Create Event Handlers for mouse
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
        
      // Create textbox     
      var string = "<p>Total Population</strong>: " + d.properties.total_population + "</p>";
      string += "<p><strong>% population</strong>: " + d.properties.total_population + "%</p>";

      d3.select("#textbox")
        .html("")
        .append("text")
        .html(string);

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

      console.log(municipality_data_age)

      //This section removes the existing bar chart displaying the country data and creates a new bar chart with the municipality data
      //It's the same bar graph as above with new data and a function that removes the old rects and texts 

       x.domain(municipality_data_age.map(function(d) { return d.name; }));
	 	y.domain([0, d3.max(municipality_data_age , function(d) { return d.value; })]);

	      chart.selectAll(".bar")
	      .remove()

	       chart.selectAll(".y.baraxis")
	      	.remove()      

			chart.append("g")
			  .attr("class", "y baraxis")
			  .call(yAxis);

			chart.selectAll(".bar")
			  .data(municipality_data_age)
			.enter().append("rect")
			  .attr("class", "bar")
			  .attr("x", function(d) { return x(d.name); })
			  .attr("y", function(d) { return y(d.value); })
			  .attr("height", function(d) { return barHeight - y(d.value); })
			  .attr("width", x.bandwidth());

      }
  

  function handleMuniMouseOut(d) {
    // Use D3 to select element, change color back to normal
    d3.select(this) 
      .attr("class", "bubble")

      // Remove municipality text on mouse out
      tooltip.transition()    
        .duration(500)    
        .style("opacity", 0); 

      // Restore country population on mouse out 
      x.domain(country_data_age.map(function(d) { return d.name; }));
	 	y.domain([0, d3.max(country_data_age , function(d) { return d.value; })]);

	      chart.selectAll(".bar")
	      .remove()

	       chart.selectAll(".y.baraxis")
	      	.remove()      

			chart.append("g")
			  .attr("class", "y baraxis")
			  .call(yAxis);

			chart.selectAll(".bar")
			  .data(country_data_age)
			.enter().append("rect")
			  .attr("class", "bar")
			  .attr("x", function(d) { return x(d.name); })
			  .attr("y", function(d) { return y(d.value); })
			  .attr("height", function(d) { return barHeight - y(d.value); })
			  .attr("width", x.bandwidth());
  }
      

	//Append a defs (for definition) element to SVG
	var defs = svg.append("defs");
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
	svg.append("defs")
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
	var legendsvg = svg.append("g")
		.attr("class", "legendWrapper")
		// Sets the actual position of the legend  container
		.attr("transform", "translate(" + (width/2) + "," + (height/28) + ")");
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
		.attr("y", -10)
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


  // For viewing file objects, REMEMBER TO DELETE 
  console.log(nl);

// Creates a white boundary between the provinces. This has to come before the text below or else the text will be cut off by the boundary lines
svg.append("path")
      .attr("class", "province-boundaries")
      .datum(topojson.feature(nl, nl.objects.provinces, function(a, b) { return a !== b; }))
      .attr("d", path);

// Select all provinces properties and append a text element of the province. Path.centroid function centers the text according to geo data
svg.selectAll(".provinces.properties")
    .data(topojson.feature(nl, nl.objects.provinces).features)
  .enter().append("text")
    .attr("class", function(d) { return "subunit-label " + d.properties.province; })
    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .text(function(d) { return d.properties.province; });


});



