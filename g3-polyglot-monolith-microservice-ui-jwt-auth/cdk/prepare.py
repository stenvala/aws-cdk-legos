import json
import argparse


FILE = 'props.json'


def main(args):
    data = {
        'amisAuth': args.amisauth
    }
    to_save = json.dumps(data, indent=4)
    with open(FILE, 'w') as f:
        f.write(to_save)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-amisauth', default='api',
                        help='Authentication to amis: api, jwt or lambda')
    args = parser.parse_args()
    main(args)
