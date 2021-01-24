from random import random

def handler(event, context):
    
    laps = len(event['msg']) - 1

    return {   
        'finalResult': {
            'msg': event['msg'] + [f'Finally succeeded after {laps} tries.'],            
            'randoms': event['value']
        },        
    }
