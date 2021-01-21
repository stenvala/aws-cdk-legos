import json
import requests
import argparse
from types import SimpleNamespace
import util


def main(args):
    base = util.get_value(args.aws, 'monoUrl')
    if not args.aws:
        url = base + 'api/init/table'
        print('Init database')
        print(f'Method GET endpoint {url}')
        response = requests.get(url)

    #
    url = base + 'api/init/users'
    print('Init users')
    print(f'Method GET endpoint {url}')
    response = requests.get(url)
    util.print_result(response)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-aws', action='store_true',
                        help='Give this to use AWS end point, otherwise uses local')
    args = parser.parse_args()
    main(args)
