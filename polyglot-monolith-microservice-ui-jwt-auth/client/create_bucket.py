from minio import Minio
from minio.error import S3Error

USER = 'admin'
PASS = 'password'
BUCKET = 'amis'
URL = 'localhost:8002'

client = Minio(
    URL,
    access_key=USER,
    secret_key=PASS,
    secure=False
)

print(f'Creating bucket {BUCKET} to {URL}')

found = client.bucket_exists(BUCKET)
if not found:
    client.make_bucket(BUCKET)
    print('Bucket created')
else:
    print('Bucket alread exists')
