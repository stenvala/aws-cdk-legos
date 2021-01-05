import requests
import json
import argparse
import util

ID = 'randomid'


def main(args):
    base = util.get_value(args.aws, 'authUrl')
    print('Using base url %s' % base)
    print('-- ENCODED JWT')
    response = requests.post(base + 'jwt', json={
        'docId': ID,
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
        'docId': ID,
        'area': 'image',
        'permission': 'DELETE',
        'jwt': jwt
    })
    print(response.status_code)

    print('-- SHOULD FAIL FOR ID')
    response = requests.post(base + 'auth', json={
        'docId': ID + '1',
        'area': 'image',
        'permission': 'DELETE',
        'jwt': jwt
    })
    print(response.status_code)

    print('-- SHOULD FAIL FOR AREA')
    response = requests.post(base + 'auth', json={
        'docId': ID,
        'area': 'images',
        'permission': 'DELETE',
        'jwt': jwt
    })
    print(response.status_code)

    print('-- SHOULD FAIL FOR PERMISSION')
    response = requests.post(base + 'auth', json={
        'docId': ID,
        'area': 'images',
        'permission': 'DELETES',
        'jwt': jwt
    })
    print(response.status_code)

    print('-- SHOULD FAIL FOR JWT')
    response = requests.post(base + 'auth', json={
        'docId': ID,
        'area': 'image',
        'permission': 'DELETE',
        'jwt': jwt + '1'
    })
    print(response.status_code)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-aws', action='store_true',
                        help='Give this to use AWS end point, otherwise uses local')
    args = parser.parse_args()
    main(args)
