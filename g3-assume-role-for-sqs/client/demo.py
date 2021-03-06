import json
import requests
import argparse
import time
import boto3

client = boto3.client('s3')

FILE_NAME = 'temp.json'
WAIT_TIME = 5


def main(args):
    bucket_name = get_bucket_name()
    if not args.onlydelete:
        print(f'Sending message {args.msg}')
        url = get_url()
        request_data = get_queue_params()
        request_data['msg'] = args.msg
        print(request_data)
        data = requests.post(get_url(), json=request_data)
        print_result(data)

        was_file_found = check_until_file(bucket_name)

        if not was_file_found:
            return

        s3_response_object = client.get_object(
            Bucket=bucket_name, Key=FILE_NAME)
        bytes_content = s3_response_object['Body'].read()

        print('File content was')
        str_content = bytes_content.decode('utf-8')
        print(str_content)
        if args.msg in str_content:
            print('Correct content')
        else:
            print('Incorrect content')
            exit()

    if not args.nodelete:
        print(f'Deleting file. Response of delete operation:')
        response = client.delete_object(
            Bucket=bucket_name,
            Key=FILE_NAME)
        print(response)

    else:
        print(f'Keeping file in S3')


def check_until_file(bucket_name, round=1):
    if round > 10:
        print('Too many tries. Stopping.')
        return False
    print(f'Checking if file exists. Round {round}.')
    objs = client.list_objects_v2(Bucket=bucket_name)
    if 'Contents' in objs:
        for i in objs['Contents']:
            if i['Key'] == FILE_NAME:
                print('File found! Everything worked as expected.')
                return True
    print(f'File not found. Waiting {WAIT_TIME} s.')
    time.sleep(WAIT_TIME)
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument('-msg', default='Hello dude!')
    parser.add_argument('-nodelete', action='store_true')
    parser.add_argument('-onlydelete', action='store_true')

    args = parser.parse_args()

    main(args)
