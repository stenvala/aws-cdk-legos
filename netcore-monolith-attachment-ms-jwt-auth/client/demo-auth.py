import requests
import json

base = 'http://localhost:6108/'
id = 'randomid'

print('-- ENCODED JWT')
response = requests.post(base + 'jwt', json={
    'docId': id,
    'permissions': [
        {'id': 'image',
         'permissions': ['DELETE', 'READ', 'WRITE']}
    ]
})
body = json.loads(response.content)
jwt = body['jwt']
print(jwt)

print('-- SHOULD BE OK')
response = requests.post(base + 'auth', json={
    'docId': id,
    'area': 'image',
    'permission': 'DELETE',
    'jwt': jwt
})
print(response.status_code)

print('-- SHOULD FAIL FOR ID')
response = requests.post(base + 'auth', json={
    'docId': id + '1',
    'area': 'image',
    'permission': 'DELETE',
    'jwt': jwt
})
print(response.status_code)

print('-- SHOULD FAIL FOR AREA')
response = requests.post(base + 'auth', json={
    'docId': id,
    'area': 'images',
    'permission': 'DELETE',
    'jwt': jwt
})
print(response.status_code)

print('-- SHOULD FAIL FOR PERMISSION')
response = requests.post(base + 'auth', json={
    'docId': id,
    'area': 'images',
    'permission': 'DELETES',
    'jwt': jwt
})
print(response.status_code)

print('-- SHOULD FAIL FOR JWT')
response = requests.post(base + 'auth', json={
    'docId': id,
    'area': 'image',
    'permission': 'DELETE',
    'jwt': jwt + '1'
})
print(response.status_code)
