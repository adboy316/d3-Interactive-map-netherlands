// Note on isntalling jsonfilter, etc, it needs to be done like npm install -g jsonfilter (g is for glonal install)

// Download JSON files from URL
curl (url) -o file.json

// If maps are not working, convert them to the proper format using the command below 
// Remember to then pass this through mapshaper and change the obects name 
ogr2ogr \
-t_srs EPSG:4326 \
nl-municipalities-map.shp \
2018-Imergis_gemeentegrenzen_kustlijn.shp

http://prj2epsg.org/search --- this is a good website for converting .proj file

//** STEP 1 - Convert a GeoJSON feature collection to a newline-delimited stream of GeoJSON features

    // First use this
    ndjson-cat municipalities_map.json |
    ndjson-split 'd.features' \
    > municipalities_map.ndjson

    // If above doesn't work try with this
    ndjson-split 'd.features' \
    < municipalities_map_cat.json \
    > municipalities_map.ndjson

// STEP 2 - Create a postcode field in and assing it the post code value || Note: Careful between using "Text" fields or Numberical for matching
ndjson-map 'd.code = d.properties.code, d' \
  < municipalities_map.ndjson  \
  > municipalities_map.ndjson_code.ndjson 


// STEP 3 - Join both files, careful with names and type of data being joined
ndjson-join 'd.code' \
municipalities_map.ndjson_code.ndjson  \
filtered_population_municipalities.ndjson \
 > municipalities-join_pupulation.ndjson

// STEP 4 - create a municipality name field in the population properties and assing it the municipality name value
 ndjson-map 'd[1].municipality_name = d[0].properties.gemeentena, d' \
  < municipalities-join_pupulation.ndjson  \
  > municipalities-join_pupulation_fix.ndjson

// STEP 5 -  Map all the population properties to the geojson file
  ndjson-map 'd[0].properties = d[1],  d[0]' \
    < municipalities-join_pupulation_fix.ndjson \
    > municipalities-join_pupulation_final.ndjson


 //STEP 6 -- Convert back to Geojson
ndjson-reduce \
  < municipalities-join_pupulation_final.ndjson\
  | ndjson-map '{type: "FeatureCollection", features: d}' \
  > municipalities_final_map.json


// FINAL STEP- Join maps in MAPSHAPER and remember to change object names! 

//IF THINGS DON"T WORK TRY TO SUBSTITUTE WITH THESE STEPS

// STEP 4 - This is a required step. It removes properties you don't need and keeps the ones you need
ndjson-map 'd[0].properties =  {municipality_name: d[0].properties.gemeentena, population: d[1].total_pulation' \
  < municipalities-join_pupulation_fix.ndjson \
  > municipalities-join_pupulation_final.ndjson

  or

ndjson-reduce 'p.features.push(d), p' '{type:"FeatureCollection", features:[]}' \
  < nl-population_muni-join.ndjson \
  > nl-population_muni-join.json

  
//USEFUL COMMANDS

// Filter json files by ID value - returns a text file with IDs
cat nlpopulation.json | jsonfilter value..ID > nlpostocode.json

// Creates ndjson of entire file see -- https://github.com/jsonlines/jsonfilter
// You need this in order to Map below. USE two dots (..ID) if you need to skip a wild value 
cat municipalities.json | jsonfilter value > NL_Population_2018_Correct.json

// If you are having issue with JSON file converting, try to prettify the json files with the following and then convert to ndjson
python -m json.tool NL_Population_2018.json
python -m simplejson.tool nl-population_muni-join.json nl-population_muni-join-pretty.json

// This is how you can extract the data you want form the file
$ cat NL_Population_2018.json  | jsonmap "{municipality_code: this[1]}, municipality_code: this[1]}" \
> NL_Population_2018_Municipalities.ndjson

ndjson-cat NL_Population_2018_Pretty.json | ndjson-split 'Object.keys(d.value)'

ndjson-filter NL_Population_2018.ndjson 'delete d.properties.FID, true'


// Slices one didigt from postcode and stores it in a new varirable called ID
ndjson-map 'd.postcode = d.postcode.slice(1), d' \
  <  nlpopulationclean.json\
  > nlpopulationcleantest.ndjson

// Gets rid of first field, and than adds population and postcode field. 
ndjson-cat NL_Population_2018_Correct.ndjson \
  | ndjson-map '{population: d[1], postcode: +d[5]}' \
  > cb_2014_06_tract_B01003.ndjson


 // Add density field  to properties field...not sure on math
 ndjson-map 'd[0].properties = {density: Math.floor(d[1].totalpopulation / d[0].properties.Shape_Area * 2589975.2356)}, d[0]' \
  < nl-population-join.ndjson \
  > nl-population-density.ndjson

// D3 Command to quickly generate an SVG choropleth and convert it to svg
ndjson-map -r d3 \
  '(d.properties.fill = d3.scaleSequential(d3.interpolateViridis).domain([0, 4000])(d.properties.density), d)' \
  < nl-population-density.ndjson \
  > nl-population-density-color.svg

  // Quantisize to reduce file size further 
  topoquantize 1e5 \
  < nl-tracts-topo.json \
  > nl-quantized-topo.json

  // 

