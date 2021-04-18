import json
import requests
import argparse


def main():
    url = get_aws_url()
    #
    get_url = f'{url}hello-world'
    print(f'GET {get_url}')
    response = requests.get(get_url)
    print('Response')
    print(response.content.decode('utf-8'))
    #
    get_url = f'{url}hello-world/Eräjorma'
    print(f'GET {get_url}')
    response = requests.get(f'{get_url}')
    print('Response')
    print(response.content.decode('utf-8'))
    #
    get_url = f'{url}hello-world'
    data = {'name': 'Matti Nykänen'}
    print(f'POST {get_url} with data')
    print(data)
    response = requests.post(f'{get_url}', json=data)
    print('Response')
    print(response.content.decode('utf-8'))


def get_aws_url():
    with open(f'../cdk-lambda/stack-data.json', 'rb') as f:
        data = json.loads(f.read())
        stack_name = list(data.keys())[0]
        url = data[stack_name]['url']
        return url


if __name__ == "__main__":

    main()
