import json
import requests
import argparse


def main(args):    
    print(f'Sending message {args.msg}')
    url = get_url()
    request_data = get_queue_params()
    request_data['msg'] = args.msg
    data = requests.post(get_url(args), json=request_data)
    print_result(data)
    print(f'Checking if file is there')


    print(f'Deleting file')


def print_result(response):    
    print('Status %s' % response.status_code)        
    body = json.loads(response.content)
    print(json.dumps(body, indent=4, sort_keys=True))


def get_url():    
    with open(f'../cdk1/stack-data.json', 'rb') as f:
        data = json.loads(f.read())
        stack_name = list(data.keys())[0]
        url = data[stack_name]['url']
        print(url)
        return url
        
def get_queue_params():    
    with open(f'../cdk2/stack-data.json', 'rb') as f:
        data = json.loads(f.read())
        stack_name = list(data.keys())[0]
        return = data[stack_name]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()       
    parser.add_argument('-msg', default='Hello world!')

    args = parser.parse_args()

    main(args)
