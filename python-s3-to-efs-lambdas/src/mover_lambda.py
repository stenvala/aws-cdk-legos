import utils
import json
import os
import pathlib


def handler(event, context):
    # When ever new file was added to S3 bucket, this will move the file to EFS, but not deleted from S3
    for record in event['Records']:
        loc = record['s3']['object']['key']
        uploaded_file = utils.load_file_from_S3(
            record['s3']['bucket']['name'], loc)
        efs_dir = os.environ['EFS']
        p = pathlib.Path(f'{efs_dir}/{loc}')
        p.parent.mkdir(parents=True, exist_ok=True)
        with p.open("w", encoding="utf-8") as f:
            f.write(uploaded_file['Body'].read().decode('utf-8'))
    return True
