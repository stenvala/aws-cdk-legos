# AWS CDK Legos

This repository has conceptually different AWS CDK stacks using various AWS services like Lego blocks to do simple and unnecessary things. Everything is typically really simple: with one command you can go through the whole stack from initialization after clone to destroy and results are displayed in terminal. Many stacks are missing essential things that production grade code requires even though some concepts may have been presented in another, perhaps simpler, stack (like some very elementary testing). Also, the emphasasis is not on the code, it just provides the basic fail prone functionality to the stack. One should consider about the architecture and blueprints of the CDK code.

## Python virtual environment

In demo walkthroughs we use Python and there are some requirements. It is advisable to create virtual environment. Following commands set it up for you

```bash
python3 -m venv ./venv
source venv/bin/activate
pip3 install -r requirements.txt
```

If you have already created it, just activate

```bash
source venv/bin/activate
```

And when you are in virtual environment, exit by typing

```bash
deactivate
```

## Prerequisites

- You must have AWS CLI and CKD installed and configured. Look from web how. Various stacks require various permissions for your deployer IAM role. These are not explictly mentioned. When you see missing permission in deployment, go to console and add these permissions to your deployer role.
- NPM is needed
- Python 3.x is needed

## Currently available stacks

Samples are categorized by the advancedness you need to have (grade)

- g1: very basic, start going through these in the order presented below if you are really newbie
- g2: some simple, but perhaps less used concepts, that might require some experties
- g3: full microservice architectures or equivalent complexity

## Grade 1

### ts-hello-world

To learn:

- Concept for walking through these stacks
- To understand what AWS Lambda is and how to call it from browser by mapping a typescript function to url
- Environmental variables, event and context available in Lambda

### ts-rest-api

To learn:

- Deploy a full typescript based REST API to Lambda
- Unit testing of CDK and APP
- Running REST API locally during development

### ts-rest-api+s3

To learn:

- Create S3 bucket
- Use S3 bucket

### ts-s3-trigger-lambda2dynamodb

To learn:

- Create DynamoDB table in CDK and authorize Lambda to use it
- Use Dynamodb
- Trigger Lambda by adding file to S3
- Presigning S3 url and saving file to S3 with it

## Grade 2

### ts-lambda-to-lambda-with-iam

To learn:

- Add IAM authorization to Lambda API gateway
- Use IAM authorization in AWS interservice communication

### ts-custom-domain-lambda

To learn:

- How to add custom domain name to your Lambda function
- Parameter store

### python-step-functions

To learn:

- Create a state machine with Lambdas

### python-s3-to-efs-lambdas

To learn:

- How to connect EFS to Lambda
- AWS CLI with S3

## Group 3

### netcore-monolith-attachment-ms-jwt-auth

To learn:

- ASP.net REST API in Lambda (times 2 in this example)
- Vue SPA via CloudFront (I don't know vue, I'm Angular guy, just did something and not nicely)
- Using Minio (S3) and DynamoDB locally during development
- JWT auth with various authorizers (currently only custom lambda implemented)
- Python FastAPI lambda
- EventBridge to send events between lambdas

_Even though this is in master, it is still work in progress_

## Coming in the future

- Some EC2 demo
- SQS
- Kinesis
- Cronjob demo
- ECR

## Some important commands

Create new project

```bash
mkdir new-project
cd new-project
mkdir cdk
cd cdk
cdk init app --language=typescript
```
