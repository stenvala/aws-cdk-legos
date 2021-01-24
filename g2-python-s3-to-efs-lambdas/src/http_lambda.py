import json
import os
import base64
import subprocess
import sys


def handler(event, context):
    try:
        loc = os.environ['EFS'] + event['path']
        print('Load file %s' % loc)
        mime = 'application/octet-stream'
        if '.txt' in loc:
            mime = 'text/plain'
        if '.png' in loc:
            mime = 'image/png'

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
        print(sys.exc_info()[0])
        return {
            'statusCode': 404,
            'body': 'EFS contains files\n\n' + directory,
            'headers': {
                'content-type': 'text/plain',
            }
        }
