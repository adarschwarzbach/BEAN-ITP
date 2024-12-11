import json

with open('/Users/adarschwarzbach/dev/bean/src/components/SpeciesSelect/commonSpecies.json', 'r') as file:
    chemicals = json.load(file)

for chemical in chemicals:
    valence_sign = 1 if chemical["valence"][0] > 0 else -1  # Determine the sign of the valence
    chemical["mobility"] = [round(mobility / 10 / valence_sign, 2) for mobility in chemical["mobility"]]

import json

file_path = 'updated_chemicals.json'

with open(file_path, 'w') as file:
    json.dump(chemicals, file, indent=4)

file_path