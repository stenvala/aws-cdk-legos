import utils
import json
import os
import base64
import subprocess
import sys


def handler(event, context):
    print(event)
    print(event['path'])
    try:
        loc = os.environ['EFS'] + event['path']
        mime = magic.from_file(loc, mime=True)
        if mime in ['text/plain', 'text/html', 'application/json']:
            with open(loc, 'r') as f:
                data = f.read()
                return {
                    'statusCode': 200,
                    'body': data,
                    'headers': {
                        'content-type': mime,
                    }
                }
        with open(loc, 'rb') as f:
            data = f.read()
            res = base64.encodestring(data)
            return {
                'statusCode': 200,
                'body': res,
                'headers': {
                    'content-type': mime,
                },
                'isBase64Encoded': True
            }
    except:
        task = subprocess.Popen('ls -lahR',
                                cwd=os.environ['EFS'],
                                shell=True,
                                stdout=subprocess.PIPE)
        directory = task.stdout.read().decode('utf-8')
        return {
            'statusCode': 200,
            'body':  sys.exc_info()[0] + '\n\nEXISTING FILES IN EFS\n\n' + directory,
            'headers': {
                'content-type': 'text/plain',
            }
        }
