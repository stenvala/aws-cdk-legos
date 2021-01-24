def handler(event, context):
    print(event)
    print(context)
    return {
        'msg': 'something'
    }
