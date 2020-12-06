import json
import requests
import argparse


def main(args):
    if args.method == 'get':
        data = requests.get(get_url(args, 'endpoint'))
        body = json.loads(data.content)
        print(json.dumps(body, indent=4, sort_keys=True))

    if args.method == 'post':
        data = requests.post(get_url(args, 'endpoint'),
                             json={'msg': 'My message'})
        body = json.loads(data.content)
        print(json.dumps(body, indent=4, sort_keys=True))


def get_url(args, route):
    base = get_base(args)
    print(base)
    return base + route


def get_base(args):
    if args.uuid == '':
        return 'http://localhost:4001/restapi/'
    else:
        return 'https://%s.execute-api.%s.amazonaws.com/prod/restapi/' % (args.uuid, args.region)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Demo client')

    parser.add_argument('-region', default='eu-north-1',
                        help='AWS region')

    parser.add_argument('-uuid', default='',
                        help='Give this to use AWS end point, otherwise uses locale')

    parser.add_argument('-method', default='get',
                        help='What method to use')

    args = parser.parse_args()

    main(args)
