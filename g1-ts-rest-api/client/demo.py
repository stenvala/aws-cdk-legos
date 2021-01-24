import json
import requests
import argparse

STACK_NAME = 'TSRestApi-Stack'

def main(args):
    print(args.method)
    if args.method == 'get':
        data = requests.get(get_url(args, 'endpoint'))
        print_result(data)

    if args.method == 'post':
        data = requests.post(get_url(args, 'endpoint'),
                             json={'msg': 'My message'})
        print_result(data)


def print_result(response):
    if response.status_code != 200:
        print('Failed %s' % response.status_code)
        return
    body = json.loads(response.content)
    print(json.dumps(body, indent=4, sort_keys=True))


def get_url(args, route):
    base = get_base(args)
    print(base + route)
    return base + route


def get_base(args):
    if args.aws:
        with open('stack-data.json', 'rb') as f:
            data = json.loads(f.read())
            return data[STACK_NAME]['url'] + 'restapi/'        
    else:
        return 'http://localhost:4001/restapi/'
        

if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument('-aws', action='store_true',
                        help='Give this to use AWS end point, otherwise uses local')

    parser.add_argument('-method', default='get',
                        help='What method to use')

    args = parser.parse_args()

    main(args)
