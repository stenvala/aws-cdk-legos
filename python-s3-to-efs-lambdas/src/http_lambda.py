import utils
import json
import os
import base64


def handler(event, context):
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
        return utils.return_error()
