def handler(event, context):
    return {        
        'result': {
            'msg': ['Started lambda'],            
            'value': [],
            'prob': event['prob'] if 'prob' in event else 0.5
        },       
        'waitSeconds': 2
    }
