import json
import requests
import argparse
import time
import subprocess

FILE_NAME = 'temp.json'


def main(args):    
    print(f'Sending message {args.msg}')
    url = get_url()
    request_data = get_queue_params()
    request_data['msg'] = args.msg
    print(request_data)
    data = requests.post(get_url(), json=request_data)
    print_result(data)
    print(f'Checking if file is there')
    bucket_name = get_bucket_name()
    was_file_found = check_until_file(bucket_name)

    if not was_file_found:
        return    

    if not args.nodelete:
        print(f'Deleting file')        
        for output in execute(['aws', 's3', 'rm', f's3://{bucket_name}/{FILE_NAME}']):
            print(output)
    else:
        print(f'Keeping file in S3')


def check_until_file(bucket_name, round=0):
    if round > 10:
        print('Too many tries. Stopping.')
        return False
    print(f'Checking file for the {round} time')
    for output in execute(['aws', 's3', 'ls', f's3://{bucket_name}']):
        print(output)
        if FILE_NAME in output:
            print('File found')
            print(output)
            return True
        else:
            print('File not found. Waiting 1 s')
            time.sleep(1)
            return check_until_file(bucket_name, round + 1)
    

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
        return data[stack_name]


def get_bucket_name():    
    return get_queue_params()['bucketName']


def execute(cmd):
    print('Executing %s' % " ".join(cmd))
    popen = subprocess.Popen(cmd, stdout=subprocess.PIPE, universal_newlines=True)
    for stdout_line in iter(popen.stdout.readline, ""):
        yield stdout_line 
    popen.stdout.close()
    return_code = popen.wait()
    if return_code:
        raise subprocess.CalledProcessError(return_code, cmd)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()       
    parser.add_argument('-msg', default='Hello dude!')
    parser.add_argument('-nodelete', action='store_true')
    args = parser.parse_args()

    main(args)
