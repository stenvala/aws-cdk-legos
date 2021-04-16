import json
import requests

with open('stack-data.json', 'rb') as f:
    data = json.loads(f.read())
    stack_name = list(data.keys())[0]
    url = data[stack_name]['url']

print(f'Making get request to {url}')
response = requests.get(url)
print(f'Status {response.status_code}')
if response.status_code == 200:
    print(json.dumps(json.loads(response.content), indent=4))

print(f'Making post request to {url}')
response = requests.post(url, json={'msg': 'str', 'array': [1, 2, 3]})
print(f'Status {response.status_code}')
if response.status_code == 200:
    print(json.dumps(json.loads(response.content), indent=4))
