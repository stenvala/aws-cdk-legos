import json
import requests

with open('stack-data.json', 'rb') as f:
    data = json.loads(f.read())
    stack_name = list(data.keys())[0]
    base = data[stack_name]['url']

urls = ['temp.txt', 'file-does-not-exists']
for u in urls:
    url = base + u
    print(f'Making get request to {url}')
    response = requests.get(url)
    print(response.content.decode('utf-8'))
