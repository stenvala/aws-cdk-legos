import json
import requests
import argparse

STACK_NAME = 'NetcoreSystem-Stack'


def main(args):
    urls = get_urls(args)

    gets = [
        urls['monoUrl'] + 'api/init/table',
        urls['monoUrl'] + 'api/init/users'
    ]

    for url in gets:
        print(f'Method GET endpoint {url}')
        response = requests.get(url)
        print_result(response)


def print_result(response):
    failed = False
    if response.status_code != 200:
        print('Failed %s' % response.status_code)
        failed = True
    body = json.loads(response.content)
    print(json.dumps(body, indent=4, sort_keys=True))
    if failed:
        exit()


def get_urls(args):
    file = 'stack-data.json' if args.aws else 'local-data.json'
    with open(file, 'rb') as f:
        data = json.loads(f.read())
        return data[STACK_NAME]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument('-aws', action='store_true',
                        help='Give this to use AWS end point, otherwise uses local')

    parser.add_argument('-method', default='get',
                        help='What method to use')

    args = parser.parse_args()

    main(args)
