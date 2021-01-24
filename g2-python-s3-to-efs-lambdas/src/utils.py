import boto3


def load_file_from_S3(bucket, file):
    return get_s3_client().get_object(Bucket=bucket, Key=file)


def get_s3_client():
    return boto3.client('s3')
