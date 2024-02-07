import boto3
import botocore
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

client_config = botocore.config.Config(max_pool_connections=990)
lambda_client = boto3.client('lambda', config=client_config)

def invoke_lambda_function(args):
    # Extract arguments specific to the function call
    point_c = args[0]
    point_mobility_or_CI = args[1]
    species = args[2]
    ionicEffect = args[3]
    index = args[4]
    lambda_type = args[5]  # Determines which Lambda function to call

    # Prepare the payload based on Lambda function type
    payload = {
        "ionicEffect": ionicEffect,
        "point_c_LE": point_c,
        "species": species,
    }
    
    if lambda_type in ['lambda_1', 'lambda_2']:
        payload["point_mobility"] = point_mobility_or_CI
        function_suffix = lambda_type.split('_')[-1]
    else:  # for lambda_3
        payload["point_c_CI"] = point_mobility_or_CI
        function_suffix = '3'

    # Invoke the corresponding Lambda function
    response = lambda_client.invoke(
        FunctionName=f'arn:aws:lambda:us-west-1:039289163902:function:heatmap_point_v2_{function_suffix}',
        InvocationType='RequestResponse',
        Payload=json.dumps(payload)
    )
    result = json.loads(response['Payload'].read())
    return index, result


# 323 - 647

def organize_results(results):
    sorted_results = sorted(results, key=lambda x: x[0])
    
    list_0_323 = []
    list_324_647 = []
    list_648_up = []
    
    # Iterate through the original list and append each sublist to the appropriate new list
    for sublist in sorted_results:
        if 0 <= sublist[0] <= 323:
            list_0_323.append(sublist)
        elif 324 <= sublist[0] <= 647:
            list_324_647.append(sublist)
        elif sublist[0] >= 648:
            list_648_up.append(sublist)
            
    def chunk_list(nums, chunk_size=18):
         return [nums[i:i + chunk_size] for i in range(0, len(nums), chunk_size)]
    
    list_1 = chunk_list(list_0_323)  # First 324 elements
    list_2 = chunk_list(list_324_647)  # Next 324 elements
    list_3 = chunk_list(list_648_up)  # Remaining elements
    
    return list_1, list_2, list_3
            
    
    

    
def lambda_handler(event, context):
    species = event.get('species')
    ionicEffect = event.get('ionicEffect')
    
    # Your predefined values
    LE_C_values =  [0.001, 0.00150131, 0.00225393, 0.00338386, 0.00508022, 0.00762699, 0.01145048, 0.01719072, 0.02580862, 0.03874675, 0.05817091, 0.08733262, 0.13111339, 0.19684194, 0.29552092, 0.44366873, 0.66608463, 1.0]
    mobility_values = [-1.00000000e-08, -1.23529412e-08, -1.47058824e-08, -1.70588235e-08,
       -1.94117647e-08, -2.17647059e-08, -2.41176471e-08, -2.64705882e-08,
       -2.88235294e-08, -3.11764706e-08, -3.35294118e-08, -3.58823529e-08,
       -3.82352941e-08, -4.05882353e-08, -4.29411765e-08, -4.52941176e-08,
       -4.76470588e-08, -5.00000000e-08]
    point_c_values =  [0.001, 0.00150131, 0.00225393, 0.00338386, 0.00508022, 0.00762699, 0.01145048, 0.01719072, 0.02580862, 0.03874675, 0.05817091, 0.08733262, 0.13111339, 0.19684194, 0.29552092, 0.44366873, 0.66608463, 1.0]

    # Initialize argument lists for each Lambda function
    args_list_lambda_1 = []
    args_list_lambda_2 = []
    args_list_lambda_3 = []
    index = 0  # Initialize index for ordering results

    # Arguments for Lambda 1
    for LE_C in LE_C_values:
        for mobility in mobility_values:
            args_list_lambda_1.append((LE_C, mobility, species, ionicEffect, index, 'lambda_1'))
            index += 1

    # Arguments for Lambda 2
    for LE_C in LE_C_values:
        for mobility in mobility_values:
            args_list_lambda_2.append((LE_C, mobility, species, ionicEffect, index, 'lambda_2'))
            index += 1

    # Arguments for Lambda 3
    for LE_C in LE_C_values:
        for point_c_CI in point_c_values:
            args_list_lambda_3.append((LE_C, point_c_CI, species, ionicEffect, index, 'lambda_3'))
            index += 1

    # Combine all argument lists
    combined_args_list = args_list_lambda_1 + args_list_lambda_2 + args_list_lambda_3

    # Execute all tasks in parallel
    start_time = time.time()
    results = []
    with ThreadPoolExecutor(max_workers=990) as executor:
        futures = [executor.submit(invoke_lambda_function, args) for args in combined_args_list]
        for future in as_completed(futures):
            results.append(future.result())

    # grid_lambda_1, grid_lambda_2, grid_lambda_3 = organize_results_separately(results, LE_C_values, mobility_values, point_c_values)


    list_1, list_2, list_3 = organize_results(results)

    total_time = time.time() - start_time

    return {
        "grid_results_1": list_1,
        "grid_results_2": list_2,
        "grid_results_3": list_3,
        "total_time": total_time,
    }