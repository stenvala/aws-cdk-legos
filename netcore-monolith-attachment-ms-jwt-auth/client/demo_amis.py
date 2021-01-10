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
    print('Active document "' + doc['name'] + '"')
    doc_id = doc['id']
    #
    jwt_auth = get_jwt(base, auth, doc_id)
    #
    base_amis = util.get_value(args.aws, 'amisUrl')
    # headers(base_amis, jwt_auth)
    # decoded(base_amis, jwt_auth)
    if not args.aws:
        # Naturally, in AWS we can't list all the buckets that are there. That would not make any sense. So this is only for minio.
        bucket(base_amis, jwt_auth)
    #
    get_files(base_amis, jwt_auth, doc_id)
    #
    permissions = demo_mono.get_permissions(base, auth)
    area = get_first_area_with_add(permissions)
    print(f'Add files to area {area}')
    files = [
        {
            'name': 'temp.txt',
            'content_type': 'text/plain; charset=UTF-8'},
        {'name': 'img.jpg',
         'content_type': 'image/jpeg'}
    ]
    for f in files:
        presign_data = get_presigned_url(
            base_amis, jwt_auth, doc_id, area, f)
        upload_file_to_presigned_url(
            presign_data['url'], presign_data['key'], f)
    files = get_files(base_amis, jwt_auth, doc_id)

    get_file(base_amis, jwt_auth, files[0]['path'])
    delete_file(base_amis, jwt_auth, files[0]['path'])

    files = get_files(base_amis, jwt_auth, doc_id)
    get_file(base_amis, jwt_auth, files[0]['path'])

    delete_file(base_amis, jwt_auth, files[0]['path'])
    files = get_files(base_amis, jwt_auth, doc_id)


def upload_file_to_presigned_url(url, key, f):
    print('Upload file from %s' % f['name'])

    with open(r'./resources/' + f['name'], 'rb') as file:
        response = requests.put(
            url=url, headers={'Content-Type': f['content_type']},
            data=file.read())
        print(f'Status of upload {response.status_code}')


def get_file(base, auth, file_name):
    parts = file_name.split('/')
    url = base + \
        f'api/files/document/{parts[0]}/area/{parts[1]}/file/{parts[2]}'
    print(f'Getting presigned load url {url}')
    response = util.print_result(requests.get(url=url, headers=auth))
    presigned_url = response['url']
    print(f'File is available at {presigned_url}')
    print(f'Downloading and saving to {parts[2]}')
    response = requests.get(presigned_url)
    with open(parts[2], 'wb') as f:
        f.write(response.content)


def delete_file(base, auth, file_name):
    parts = file_name.split('/')
    url = base + \
        f'api/files/document/{parts[0]}/area/{parts[1]}/file/{parts[2]}'
    print('Delete file url %s' % url)
    response = requests.delete(url, headers=auth)
    return util.print_result(response)


def get_presigned_url(base, auth, doc_id, area, f):
    url = base + f'api/files/document/{doc_id}/area/{area}'
    print('Fetch Presigned url %s' % url)
    response = requests.post(
        url, json={'fileName': f['name'], 'contentType': f['content_type']}, headers=auth)
    return util.print_result(response)


def get_first_area_with_add(permissions):
    for i in permissions:
        if 'ADD' in permissions[i]:
            return i.replace('Permissions', '')
    print('No categories with permission to add files. Exiting.')
    exit()


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
