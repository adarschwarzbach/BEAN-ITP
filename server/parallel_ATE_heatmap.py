import boto3
import botocore
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

client_config = botocore.config.Config(
    max_pool_connections=900,
)

lambda_client = boto3.client('lambda', config=client_config)

def invoke_worker_lambda(args):
    
    pH = args[1]
    LE_C = args[0]
    species = args[2]
    ionicEffect = args[3]
    requestedOutput = args[4]
    payload =  {
      "ionicEffect": ionicEffect,
      "pH": pH,
      "LE_C":LE_C,
      "species":species,
      "requested_output":requestedOutput
    }


    response = lambda_client.invoke(
        FunctionName='arn:aws:lambda:us-west-1:039289163902:function:bean_heatmap_helper',
        InvocationType='RequestResponse',
        Payload=json.dumps(payload)
    )
    return json.loads(response['Payload'].read())


def organize_results_into_grid(flat_results, num_rows, num_columns):
    grid_results = [flat_results[i * num_columns : (i + 1) * num_columns] for i in range(num_rows)]
    return grid_results

def lambda_handler(event, context):
    # gets vars from context
    species = event.get('species')
    ionicEffect = event.get('ionicEffect')
    pH = event.get('pH')
    requestedOutput = event.get('requestedOutput')
    
    # Generate 20 LE_C values between 1-1000
    #ToDo: update to be logarithmic
    LE_C_values = [1.0, 1.43844989, 2.06913808, 2.97635144, 4.2813324, 6.15848211,
    8.8586679, 12.74274986, 18.32980711, 26.36650899, 37.92690191,
    54.55594781, 78.47599704, 112.88378917, 162.37767392, 233.57214691,
    335.98182863, 483.29302386, 695.19279618, 1000.0
    ]
    

    # Generate 20 pH values from [pH-1, pH+1]
    pH_values = [pH - 1 + i * 0.1 for i in range(21)]

    args_list = [(LE_C, pH, species, ionicEffect, requestedOutput) for LE_C in LE_C_values for pH in pH_values]

    start_time = time.time()  # Start timer
    
    with ThreadPoolExecutor(max_workers=900) as executor:
        results = list(executor.map(invoke_worker_lambda, args_list))

    total_time = time.time() - start_time  # Calculate total time
    
    num_rows = len(LE_C_values)
    num_columns = len(pH_values)
    grid_results = organize_results_into_grid(results, num_rows, num_columns)
    
    
    # Count the number of calculations and itpCheck occurrences
    total_calculations = len(results)
    itpCheck_true_count = sum(1 for res in results if json.loads(res['body'])['itpCheck'])
    
    

    return {
        "grid_results": grid_results,
        "total_time": total_time,
        "total_calculations": total_calculations,
        "itpCheck_true_count": itpCheck_true_count
    }