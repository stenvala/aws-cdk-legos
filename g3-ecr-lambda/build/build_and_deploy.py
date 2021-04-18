import pathlib
import shutil
import json
from glob import glob
import argparse
import utils
import boto3

client = boto3.client('sts')


def get_props():
    with open('../props.json', 'r') as f:
        return json.load(f)


def main(args):
    path = pathlib.Path('dist')
    if path.is_dir():
        shutil.rmtree(path)
    path.mkdir(parents=True)

    for file_name in glob('../src/*.py'):
        shutil.copy(file_name, path)

    shutil.copy('../src/requirements.txt', path)

    print('Files copied successfully')

    data = get_props()

    if args.tag is None:
        hash_value = utils.get_hash('.')
        prefix = data['imageTagPrefix']
        args.tag = f'{prefix}-{hash_value}'

    with open('latest_version.txt', 'w') as f:
        f.write(args.tag)

    print('=================')
    print(f'Pushing with tag {args.tag}')
    print('=================')

    account = client.get_caller_identity().get('Account')
    region = client.meta.region_name
    repository_name = data['repositoryName']

    print(f'AWS account {account}')
    print(f'Region {region}')
    print(f'Repository {repository_name}')
    print('=================')

    repo = f'{account}.dkr.ecr.{region}.amazonaws.com/{repository_name}'

    commands = [
        f'docker build -t {args.tag} .',
        f'aws ecr get-login-password --region {region} | docker login --username AWS --password-stdin {account}.dkr.ecr.{region}.amazonaws.com',
        f'docker tag {args.tag}:latest {repo}:{args.tag}',
        f'docker push {repo}:{args.tag}'
    ]

    for command in commands:
        print(f'Executing {command}')
        for line in utils.run_command(command):
            print(line.decode('utf-8').strip())


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-tag')

    args = parser.parse_args()
    main(args)
