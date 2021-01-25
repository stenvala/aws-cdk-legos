import json
import requests
import argparse
import urllib.parse

DEMO_FILE = 'demo_data.json'
FILE_NAME = 'trigger/some-file-whatever-demo.json'
CONF_FILE = 'stack-data.json'

def main(args):
    print(args.method)
    if args.method == 'get':        
        path = 'data/' + urllib.parse.quote_plus(FILE_NAME)
        data = requests.get(get_url(args, path))
        print_result(data)

    if args.method == 'post':        
        presign = get_presigned_url(args)
        print('Presign done')        
        with open(DEMO_FILE, 'rb') as f:

            files = {'file': (DEMO_FILE, f)}
            data = presign['fields']
            #
            data['key'] = FILE_NAME

            print('Sending file directly to S3 %s' % presign['url'])
            response = requests.post(
                presign['url'], data=data, files=files)

            print(
                f'File upload HTTP status code: {response.status_code}')


def get_presigned_url(args):
    response = requests.get(get_url(args, "presign"))
    if response.status_code != 200:
        print(response.status_code)
        print(response.content)
        exit()
    return json.loads(response.content)


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
    print("Calling %s" % base + route)
    return base + route


def get_base(args):
    with open(CONF_FILE, 'rb') as f:
        data = json.loads(f.read())
        stack_name = list(data.keys())[0]
        url = data[stack_name]['url']
        return '%srestapi' % (url)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Demo client')

    parser.add_argument('-method', default='get',
                        help='What method to use, options post and get')

    args = parser.parse_args()

    main(args)
