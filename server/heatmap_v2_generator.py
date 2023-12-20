import boto3
import botocore
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

client_config = botocore.config.Config(
    max_pool_connections=990,
)

lambda_client = boto3.client('lambda', config=client_config)

def invoke_worker_lambda_1_2(args):
    
    point_mobility = args[1]
    point_c_LE = args[0]
    species = args[2]
    ionicEffect = args[3]
    payload =  {
      "ionicEffect": ionicEffect,
      "point_mobility": point_mobility,
      "point_c_LE":point_c_LE,
      "species":species,
    }


    response = lambda_client.invoke(
        FunctionName='arn:aws:lambda:us-west-1:039289163902:function:heatmap_point_v2_1',
        InvocationType='RequestResponse',
        Payload=json.dumps(payload)
    )
    return json.loads(response['Payload'].read())
    
    
    
# def invoke_worker_lambda_3(args):
    
#     pH = args[1]
#     LE_C = args[0]
#     species = args[2]
#     ionicEffect = args[3]
#     requestedOutput = args[4]
#     payload =  {
#       "ionicEffect": ionicEffect,
#       "pH": pH,
#       "LE_C":LE_C,
#       "species":species,
#       "requested_output":requestedOutput
#     }


#     response = lambda_client.invoke(
#         FunctionName='arn:aws:lambda:us-west-1:039289163902:function:bean_heatmap_helper',
#         InvocationType='RequestResponse',
#         Payload=json.dumps(payload)
#     )
#     return json.loads(response['Payload'].read())


def organize_results_into_grid(flat_results, num_rows, num_columns):
    grid_results = [flat_results[i * num_columns : (i + 1) * num_columns] for i in range(num_rows)]
    return grid_results

def lambda_handler(event, context):
    # gets vars from context
    species = event.get('species')
    ionicEffect = event.get('ionicEffect')

    
    # Generate 20 LE_C values between 1-1000
    LE_C_values = [0.001,
     0.0014384498882876629,
     0.00206913808111479,
     0.002976351441631319,
     0.004281332398719396,
     0.006158482110660267,
     0.008858667904100823,
     0.012742749857031334,
     0.018329807108324356,
     0.026366508987303583,
     0.0379269019073225,
     0.05455594781168517,
     0.07847599703514611,
     0.11288378916846883,
     0.1623776739188721,
     0.23357214690901212,
     0.3359818286283781,
     0.4832930238571752,
     0.6951927961775606,
     1.0]

    

 
    # mobility_values = [-5e-09, -7.368e-09, -9.737e-09, -1.2105e-08, -1.4474e-08, -1.6842e-08, -1.9211e-08, -2.1579e-08, -2.3947e-08, -2.6316e-08, -2.8684e-08, -3.1053e-08, -3.3421e-08, -3.5789e-08, -3.8158e-08, -4.0526e-08, -4.2895e-08, -4.5263e-08, -4.7632e-08, -5e-08]
    mobility_values = [ -3.1053e-08, -3.3421e-08, -3.5789e-08, -3.8158e-08, -4.0526e-08, -4.2895e-08, -4.5263e-08, -4.7632e-08, -5e-08]
    args_list = [(LE_C, mobility, species, ionicEffect) for LE_C in LE_C_values for mobility in mobility_values]

    start_time = time.time()  # Start timer
    
    with ThreadPoolExecutor(max_workers=500) as executor:
        results = list(executor.map(invoke_worker_lambda_1_2, args_list))

    total_time = time.time() - start_time  # Calculate total time
    
    num_rows = len(LE_C_values)
    num_columns = len(mobility_values)
    grid_results = organize_results_into_grid(results, num_rows, num_columns)
    
    
    # Count the number of calculations and itpCheck occurrences
    total_calculations = len(results)
    
    

    return {
        "grid_results": grid_results,
        "total_time": total_time,
        "total_calculations": total_calculations,
    }