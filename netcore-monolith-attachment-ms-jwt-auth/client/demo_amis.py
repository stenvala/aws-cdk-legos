import json
import requests
import argparse
from types import SimpleNamespace
import util
import demo_mono


def main(args):
    base = util.get_value(args.aws, 'monoUrl')

    if not args.aws:
        gets = ['api/init/table']
        #
        print('Init database and get default')
        for url in gets:
            print(f'Method GET endpoint {url}')
            response = requests.get(base + url)
            util.print_result(response)
    #
    auth = util.login(base, 'admin', 'demo')
    #
    docs = demo_mono.get_all_documents(base, auth)
    if len(docs) == 0:
        print('No documents. Creating one.')
        doc = demo_mono.add_document(base, auth, "Some demo document")
    else:
        print('There are documents. Selecting first')
        doc = docs[0]
    print('Active document ' + doc['name'])
    doc_id = doc['id']
    #
    jwt_auth = get_jwt(base, auth, doc_id)
    #
    base_amis = util.get_value(args.aws, 'amisUrl')
    headers(base_amis, jwt_auth)
    bucket(base_amis, jwt_auth)
    decoded(base_amis, jwt_auth)
    #
    get_files(base_amis, jwt_auth, doc_id)


def headers(base, auth):
    url = base + 'api/dev/headers'
    print('Fetch headers %s' % url)
    response = requests.get(url, headers=auth)
    return util.print_result(response)


def bucket(base, auth):
    url = base + 'api/dev/buckets'
    print('Test bucket %s' % url)
    response = requests.get(url, headers=auth)
    return util.print_result(response)


def decoded(base, auth):
    url = base + 'api/dev/decoded-jwt'
    print('Test decoding jwt from header %s' % url)
    response = requests.get(url, headers=auth)
    return util.print_result(response)


def get_files(base, auth, doc_id):
    url = base + f'api/files/document/{doc_id}'
    print('Get files of document %s' % url)
    response = requests.get(url, headers=auth)
    return util.print_result(response)


def get_jwt(base, auth, id):
    print('Get JWT')
    url = base + f'api/auth/permissions-jwt/{id}'
    print(url)
    response = requests.get(url, headers=auth)
    jwt = util.print_result(response)['jwt']
    return {
        'Authorization': f'Bearer {jwt}',
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-aws', action='store_true',
                        help='Give this to use AWS end point, otherwise uses local')
    args = parser.parse_args()
    main(args)
