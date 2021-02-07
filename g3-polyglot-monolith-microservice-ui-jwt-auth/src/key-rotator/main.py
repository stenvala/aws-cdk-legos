import boto3
import uuid
import os

ssm = boto3.client('ssm')

def lambda_handler(event, context):            

    value = str(uuid.uuid4()).replace('-','')

    print(value)

    response = ssm.put_parameter(
      Name=os.environ['KEY'],
      Value=value,      
      Overwrite=True)

    print(response)

    return {
      'statusCode': 200,
      'headers': {'Content-Type': 'text/plain'},
      'body': 'New key updated',
    }