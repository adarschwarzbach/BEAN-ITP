import requests
import json

# API endpoint
url = 'https://vpqyduqulg.execute-api.us-west-1.amazonaws.com/prod'

# Request data
data = {
    "ionicEffect": 0,
    "species": {
        "0": {"Name": "HCl", "valence": [-1], "mobility": [-7.91e-8], "pKa": [-5], "concentration": 0.01, "type": "LE"},
        "1": {"Name": "Tris", "valence": [1], "mobility": [2.95e-8], "pKa": [10.076], "concentration": 0.02, "type": "Background"},
        "2": {"Name": "MOPS", "valence": [-1], "mobility": [-2.69e-8], "pKa": [7.2], "concentration": 0.001, "type": "Analyte"},
        "3": {"Name": "HEPES", "valence": [-1], "mobility": [-2.35e-8], "pKa": [9.5], "concentration": 0.05, "type": "TE"}
    }
}

# Headers
headers = {
    "Content-Type": "application/json"
}

# Sending POST request to the API
response = requests.post(url, headers=headers, data=json.dumps(data))

fail_count = 0
valid = 0
long_compute_responses = []
max_valid = 0
# Checking if the request was successful
if response.status_code == 200:
    # Parsing the response
    response_data = response.json()

    for key in response_data:
        if type(response_data[key]) == list:
            for point in response_data[key]:
                for data_point in point:
                    for prick in point:
                        for k in prick:
                            if type(prick[k]) != int and type(prick[k]) != float:
                                sub_prick = prick[k]
                                try:
                                    dict_prick = json.loads(sub_prick)
                                    if dict_prick['compute_time'] > 3:
                                        long_compute_responses.append(dict_prick)
                                        max_valid = max(max_valid, dict_prick['compute_time'])
                                    valid += 1
                                except:

                                    fail_count += 1


    # Filtering results with compute time longer than 3 seconds

    # one_two = response_data["grid_results_1_2"]
    # three = response_data["grid_results_3"]

    # for item in one_two:
    #     print(json.loads(item).keys())
    #     if "errorMessage" in item[0]:
    #         continue
    #     print(json.loads(item[0]['body'])["compute_time"]  )
    #     if json.loads(item[0]['body'])["compute_time"] > 3:
    #         long_compute_responses.append(item)
        # if "body" in item[0].keys():
        #     if item[0]["body"][0]["compute_time"] > 3:
        #         long_compute_responses.append(item)

    # for item in response_data["grid_results_3"]:
    #     print(item)
    #     if item["body"]["compute_time"] > 3:
    #         long_compute_responses.append(item)


    # Printing the filtered results
    print("Responses with compute time longer than 3 seconds:")
    for item in long_compute_responses:
        print(item)
    print( 'fail', fail_count, 'valid', valid, "max valid", max_valid)
else:
    print(f"Failed to get response from the API. Status code: {response.status_code}")
