import json
import requests
import argparse
from types import SimpleNamespace
import util


def main(args):
    base = util.get_value(args.aws, 'monoUrl')
    gets = [
        base + 'api/init/table',
        base + 'api/init/users'
    ]
    #
    print('Init database')
    for url in gets:
        print(f'Method GET endpoint {url}')
        response = requests.get(url)
        print_result(response)
    #
    auth = login(base, 'admin', 'demo')
    #
    print('Get my data')
    print_result(requests.get(base + 'api/auth/me', headers=auth))
    #
    get_all_documents(base, auth)
    #
    doc = add_document(base, auth, "Invoice to be removed")
    #
    remove_document(base, auth, doc['id'])
    #
    doc = add_document(base, auth, "Invoice to be tested")
    #
    get_all_documents(base, auth)
    #
    get_permissions(base, auth)
    #
    remove_all_documents(base, auth)


def get_all_documents(base, auth):
    print('Get all existing documents')
    response = requests.get(base + 'api/documents', headers=auth)
    return print_result(response)


def add_document(base, auth, name):
    print('Add document "%s"' % name)
    response = requests.post(base + 'api/documents', json={
        "name": name
    }, headers=auth)
    return print_result(response)


def remove_document(base, auth, id):
    print('Remove document "%s"' % id)
    response = requests.delete(base + f'api/documents/{id}', headers=auth)
    return print_result(response)


def remove_all_documents(base, auth):
    all = get_all_documents(base, auth)
    for i in all:
        remove_document(base, auth, i['id'])


def get_permissions(base, auth):
    print('Get permissions')
    response = requests.get(base + 'api/auth/permissions', headers=auth)
    return print_result(response)


def print_result(response):
    failed = False
    if response.status_code != 200:
        print('Failed %s' % response.status_code)
        failed = True
    body = json.loads(response.content)
    print(json.dumps(body, indent=4, sort_keys=True))
    if failed:
        exit()
    return body


def login(base, username, password):
    print('Logging in as %s' % username)
    response = requests.post(base + 'api/auth/login', json={
        'username': username,
        'password': password
    })
    body = json.loads(response.content,
                      object_hook=lambda d: SimpleNamespace(**d))
    return {
        'Authorization': 'Basic %s,%s' % (body.id, body.sessionId)
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-aws', action='store_true',
                        help='Give this to use AWS end point, otherwise uses local')
    args = parser.parse_args()
    main(args)
