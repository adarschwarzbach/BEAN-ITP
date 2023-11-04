import boto3
import botocore
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

client_config = botocore.config.Config(
    max_pool_connections=100,
)

lambda_client = boto3.client('lambda', config=client_config)

def invoke_worker_lambda(args):
    
    pH = args[1]
    LE_C = args[0]
    payload =  {
      "ionicEffect": 0,
      "pH": pH,
      "LE_C":LE_C,
      "species": {
        "0": {
          "Name": "HCl",
          "valence": [
            -1
          ],
          "mobility": [
            -7.91e-8
          ],
          "pKa": [
            -2
          ],
          "concentration": 0.01,
          "type": "LE"
        },
        "1": {
          "Name": "Tris",
          "valence": [
            1
          ],
          "mobility": [
            2.95e-8
          ],
          "pKa": [
            8.076
          ],
          "concentration": 0.02,
          "type": "Background"
        },
        "2": {
          "Name": "MOPS",
          "valence": [
            -1
          ],
          "mobility": [
            -2.69e-8
          ],
          "pKa": [
            7.2
          ],
          "concentration": 0.001,
          "type": "Analyte"
        },
        "3": {
          "Name": "HEPES",
          "valence": [
            -1
          ],
          "mobility": [
            -2.35e-8
          ],
          "pKa": [
            7.5
          ],
          "concentration": 0.005,
          "type": "TE"
        }
      }
    }


    response = lambda_client.invoke(
        FunctionName='arn:aws:lambda:us-west-1:039289163902:function:bean_ATE_heatmap_generator',
        InvocationType='RequestResponse',
        Payload=json.dumps(payload)
    )
    return json.loads(response['Payload'].read())


def organize_results_into_grid(flat_results, num_rows, num_columns):
    grid_results = [flat_results[i * num_columns : (i + 1) * num_columns] for i in range(num_rows)]
    return grid_results

def lambda_handler(event, context):
    # Generate 20 LE_C values between 1-1000
    LE_C_values = [i * 50 for i in range(1, 21)]

    # Generate 20 pH values between 8.7 - 1 and 8.7 + 2
    pH_values = [8.7 + i * 0.15 - 1 for i in range(20)]

    args_list = [(LE_C, pH) for LE_C in LE_C_values for pH in pH_values]

    with ThreadPoolExecutor(max_workers=700) as executor:
        results = list(executor.map(invoke_worker_lambda, args_list))

    num_rows = len(LE_C_values)
    num_columns = len(pH_values)
    grid_results = organize_results_into_grid(results, num_rows, num_columns)

    return grid_results