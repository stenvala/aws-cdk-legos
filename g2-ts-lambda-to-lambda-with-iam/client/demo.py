import json
import requests
import argparse


def main(args):    
    print(f'Testing http request to stack #{args.stack}')
    data = requests.get(get_url(args))
    print_result(data)


def print_result(response):    
    print('Status %s' % response.status_code)        
    body = json.loads(response.content)
    print(json.dumps(body, indent=4, sort_keys=True))


def get_url(args):    
    with open(f'../cdk{args.stack}/stack-data.json', 'rb') as f:
        data = json.loads(f.read())
        stack_name = list(data.keys())[0]
        url = data[stack_name]['url']
        print(url)
        return url
        

if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument('-stack', default='1',
                        help='Give 1 or 2')    

    args = parser.parse_args()

    main(args)
