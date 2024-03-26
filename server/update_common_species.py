import json

with open('/Users/adarschwarzbach/dev/bean/src/components/SpeciesSelect/commonSpecies.json', 'r') as file:
    chemicals = json.load(file)

# Update the mobility value as per the requirements
for chemical in chemicals:
    valence_sign = 1 if chemical["valence"][0] > 0 else -1  # Determine the sign of the valence
    chemical["mobility"] = [round(mobility / 10 / valence_sign, 2) for mobility in chemical["mobility"]]

# Write the updated list of chemicals to a JSON file
import json

# Define the file path
file_path = 'updated_chemicals.json'

# Writing the updated chemicals list to a file
with open(file_path, 'w') as file:
    json.dump(chemicals, file, indent=4)

file_path