import json
import pprint 
import codecs

# Load json file and assing it to variable data
# Run with python3 to get rid of 'u' (unicode) in front of values 
with open("provinces_population.json", "r") as read_file:
    #data = json.load(read_file)
 	data = json.load(codecs.open('provinces_population.json', 'r', 'utf-8-sig'))
 
# Pretty print json file
pp = pprint.PrettyPrinter(indent=0)
#pp.pprint(data['value'].items()[1])    #prints all items in dict
#pp.pprint(data.keys())		#prints all keys in dict
#pp.pprint(data['value']['10007']['RegioS'])		#print specfific item in dict
#pp.pprint(data['value'].keys()[2])		#print all second keys

# Open text file for writing
#myfile = open('filtered_pop_municidata_file.ndjson', 'w')


# Write Json file
with open("filtered_population_provinces.ndjson", "w") as outfile:
# Iterate through each second key in an object
	for x in data['value'].keys(): 


		

			#Append new object to text file
		newdata = {
		"code":data['value'][x]['RegioS'], 
		"total_population":data['value'][x]['TotaleBevolking_1'],
		"man":data['value'][x]['Mannen_2'],
		"woman":data['value'][x]['Vrouwen_3'],
		"5orYounger":data['value'][x]['JongerDan5Jaar_4'],
		"5to10":data['value'][x]['k_5Tot10Jaar_5'],
		"10to15":data['value'][x]['k_10Tot15Jaar_6'],
		"15to20":data['value'][x]['k_15Tot20Jaar_7'],
		"20to25":data['value'][x]['k_20Tot25Jaar_8'],
		"25to45":data['value'][x]['k_25Tot45Jaar_9'],
		"45to65":data['value'][x]['k_45Tot65Jaar_10'],
		"65to80":data['value'][x]['k_65Tot80Jaar_11'],
		"80orOlder":data['value'][x]['k_80JaarOfOuder_12'],
		"unmarried":data['value'][x]['Ongehuwd_25'],
		"married":data['value'][x]['Gehuwd_26'],
		"dutchBackground":data['value'][x]['NederlandseAchtergrond_34'],
		"migrationBackground":data['value'][x]['TotaalMetMigratieachtergrond_35'],
		}

		# Write object to text file
		#myfile.write("%s\n" %newdata)

		# write jsonfile with new lines
		json.dump(newdata, outfile)
		outfile.write("\n")

# close flle
outfile.close()

print(newdata)



	

   	#print(data['value'][x]['ID']) # Extract a specific item from the second key. Use this method to extract whatever information you want from JSON file
   	#print(data['value'][x]['RegioS'][2:]) # Use [2:] to remove unwanted characters 

 #Save json file 



