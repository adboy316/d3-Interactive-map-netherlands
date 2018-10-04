import json
import pprint 
import codecs

# Load json file and assing it to variable data
# Run with python3 to get rid of 'u' (unicode) in front of values 
with open("municipalities_population.json", "r") as read_file:
    #data = json.load(read_file)
 	data = json.load(codecs.open('municipalities_population.json', 'r', 'utf-8-sig'))
 
# Pretty print json file
pp = pprint.PrettyPrinter(indent=0)
#pp.pprint(data['value'].items()[1])    #prints all items in dict
#pp.pprint(data.keys())		#prints all keys in dict
#pp.pprint(data['value']['10007']['RegioS'])		#print specfific item in dict
#pp.pprint(data['value'].keys()[2])		#print all second keys

# Open text file for writing
#myfile = open('filtered_pop_municidata_file.ndjson', 'w')


# Write Json file
with open("filtered_pop_data_file.ndjson", "w") as outfile:
# Iterate through each second key in an object
	for x in data['value'].keys(): 

		# Append new object to text file
		newdata = {
		"code":data['value'][x]['RegioS'][2:], 
		"Total_Population":data['value'][x]['TotaleBevolking_1'],
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



