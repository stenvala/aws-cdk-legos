import json
import requests
import argparse

STACK_NAME = 'TSLambdaAndS3-Stack'
PATH = 'test-message'

def main(args):
    print(args.method)
    if args.method == 'get':
        data = requests.get(get_url(args, PATH))
        print_result(data)

    if args.method == 'delete':
        data = requests.delete(get_url(args, PATH))
        print_result(data)

    if args.method == 'post':
        data = requests.post(get_url(args),
                             json={'path': PATH,
                                   'data': {
                                       'msg': 'Some text',
                                       'array': [1, 2, 3],
                                       'boolean': True
                                   }})
        print_result(data)


def print_result(response):
    if response.status_code != 200:
        print('Failed %s' % response.status_code)
        return
    body = json.loads(response.content)
    print(json.dumps(body, indent=4, sort_keys=True))


def get_url(args, route=''):
    if route != '':
        route = '/%s' % route
    base = get_base(args)
    print(base + route)
    return base + route


def get_base(args):
    with open('stack-data.json', 'rb') as f:
        data = json.loads(f.read())
        return data[STACK_NAME]['url'] + 'restapi'        


if __name__ == "__main__":
    parser = argparse.ArgumentParser()    

    parser.add_argument('-method', default='get',
                        help='What method to use')

    args = parser.parse_args()

    main(args)
