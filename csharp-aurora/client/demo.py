import json
import requests

STACK_NAME = 'TSHelloWorld-Stack'

with open('stack-data.json', 'rb') as f:
    data = json.loads(f.read())
    url = data[STACK_NAME]['url']
    print(f'Making get request to {url}')
    response = requests.get(url)
    print(f'Status {response.status_code}')
    if response.status_code == 200:      
      print(json.dumps(json.loads(response.content), indent=4))

