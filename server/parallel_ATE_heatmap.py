import boto3
import json
from concurrent.futures import ThreadPoolExecutor

lambda_client = boto3.client('lambda')

def invoke_worker_lambda(LE_C):
    payload =  {
      "ionicEffect": 0,
      "pH": 8.7,
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

def lambda_handler(event, context):
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(invoke_worker_lambda, range(1, 1001, 10)))

    return results