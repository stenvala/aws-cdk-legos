import json
import requests
import argparse

STACK_NAME1 = 'TSLambda2Lambda1-Stack'
STACK_NAME2 = 'TSLambda2Lambda2-Stack'

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
        url = data[get_stack_name(args)]['url']
        print(url)
        return url
        
def get_stack_name(args):
    return STACK_NAME1 if args.stack == '1' else STACK_NAME2

if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument('-stack', default='1',
                        help='Give 1 or 2')    

    args = parser.parse_args()

    main(args)
