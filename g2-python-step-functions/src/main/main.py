from random import random

def handler(event, context):
    value = random()     
    is_ready = value < event['prob']
    if is_ready:
        does_succeed = random() > 0.5
        status = 'SUCCEEDED' if does_succeed else 'FAILED'
    else:
        status = 'WAITING'

    return {    
        'status': status,
        'result': {
            'value': event['value'] + [value],
            'msg': event['msg'] + [f'Did rund with status {status}'],     
            'prob': event['prob'] # This is needed if we enter the main loop again       
        },        
        'waitSeconds': 1
    }
