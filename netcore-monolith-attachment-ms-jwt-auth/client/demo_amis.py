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
        print('No documents')
        exit()
    doc_id = docs[0]['id']
    #
    jwt_auth = get_jwt(base, auth, doc_id)
    #
    base_amis = util.get_value(args.aws, 'amisUrl')
    demo(base_amis, jwt_auth)


def demo(base, auth):
    url = base + 'api/values'
    #url = 'https://ca4wr5cgv9.execute-api.eu-north-1.amazonaws.com/prod/'
    print('Do demo request to %s' % url)
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
