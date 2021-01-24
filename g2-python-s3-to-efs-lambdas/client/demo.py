import json
import requests

STACK_NAME = 'PythonLambdaAndS3toEFS-Stack'

with open('stack-data.json', 'rb') as f:
    data = json.loads(f.read())
    base = data[STACK_NAME]['url']

urls = ['temp.txt', 'file-does-not-exists']
for u in urls:
    url = base + u
    print(f'Making get request to {url}')
    response = requests.get(url)
    print(response.content.decode('utf-8'))
