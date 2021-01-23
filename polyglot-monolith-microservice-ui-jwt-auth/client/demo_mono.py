import json
import requests
import argparse
from types import SimpleNamespace
import util


def main(args):
    base = util.get_value(args.aws, 'monoUrl')
    gets = [
        base + 'api/values',
        base + 'api/init/users'
    ]
    if not args.aws:
        gets.insert(0, base + 'api/init/table')

    #
    print('Init database and get default')
    for url in gets:
        print(f'Method GET endpoint {url}')
        response = requests.get(url)
        util.print_result(response)
    #
    auth = util.login(base, 'admin', 'demo')
    #
    print('Get my data')
    util.print_result(requests.get(base + 'api/auth/me', headers=auth))
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
    get_permission_jwt(base, auth, doc['id'])
    #
    remove_all_documents(base, auth)


def get_all_documents(base, auth):
    print('Get all existing documents')
    url = base + 'api/documents'
    print(url)
    response = requests.get(url, headers=auth)
    return util.print_result(response)


def add_document(base, auth, name):
    print('Add document "%s"' % name)
    response = requests.post(base + 'api/documents', json={
        "name": name
    }, headers=auth)
    return util.print_result(response)


def remove_document(base, auth, id):
    print('Remove document "%s"' % id)
    response = requests.delete(base + f'api/documents/{id}', headers=auth)
    return util.print_result(response)


def remove_all_documents(base, auth):
    all = get_all_documents(base, auth)
    for i in all:
        remove_document(base, auth, i['id'])


def get_permissions(base, auth):
    print('Get permissions')
    response = requests.get(base + 'api/auth/permissions', headers=auth)
    return util.print_result(response)


def get_permission_jwt(base, auth, id):
    print('Get permission jwt')
    response = requests.get(
        base + 'api/auth/permissions-jwt/' + id, headers=auth)
    return util.print_result(response)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-aws', action='store_true',
                        help='Give this to use AWS end point, otherwise uses local')
    args = parser.parse_args()
    main(args)
