import json
import requests

with open('stack-data.json', 'rb') as f:
    data = json.loads(f.read())
    url = data['TSHelloWorld-Stack']['url']
    print(f'Making get request to {url}')
    response = requests.get(url)
    print(f'Request status {response.status_code}')
    if response.status_code == 200:      
      print(json.dumps(json.loads(response.content),  indent=4))

