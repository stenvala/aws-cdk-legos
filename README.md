# AWS CDK Legos

This repository has various conceptually different AWS CDK stacks using various AWS services as Lego blocks to do simple and unnecessary things.

## Prerequisites

* You must have AWS CLI installed and configured and AWS CDK installed. Look from web how. 

## Samples available

### ts-hello-world

Extremely basic hello world lambda via api gateway. Run this first. It doesn't take too long to go the whole demo through with one command.

### ts-lambda-to-lambda-with-iam

Communicate from lambda to lambda with iam auth.

### ts-rest-api

Rest API lambda with NodeJS and Express.

### ts-rest-api+s3

Rest API with some basic S3 use.

### ts-step-function+rest+s3+dynamodb

Save json file to S3 with presigned url. This save triggers lambda which moves data to dynamo and removes file from S3. Getting data removed entry from dynamo.
