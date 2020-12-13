# AWS CDK Legos

This repository has various AWS CDK samples and associated minimalistic microservice code that use AWS services as Lego blocks to do simple things.

## Pre reqs

* You must have AWS CLI installed and configured and AWS CDK installed. Look from web how. 
* For specific sample, run npm inits yourself to root, cdk and src - whenever needed. Then, build, deploy, experiment and destroy. Each sample has their own instructions. Might have also some unit tests.

## Samples available

### ts-hello-world

Extremely basic hello world lambda via api gateway.

### ts-lambda-to-lambda-with-iam

Communicate from lambda to lambda with iam auth.

### ts-rest-api

Rest API lambda with NodeJS and Express.

### ts-rest-api+s3

Rest API with some basic S3 use.

### ts-step-function+rest+s3+dynamodb

Save json file to S3 with presigned url. This save triggers lambda which moves data to dynamo and removes file from S3. Getting data removed entry from dynamo.
