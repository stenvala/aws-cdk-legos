# AWS CDK Legos

This repository has conceptually different AWS CDK stacks using various AWS services like Lego blocks to do simple and unnecessary things. Everything is typically really simple: with one command you can go through the whole stack from initialization to destroy via demo run and results are displayed in terminal. Many stacks are missing essential things that production grade code requires even though some concepts may have been presented in another, perhaps simpler, stack (like some very elementary testing, detailed consideration of dead letter queues, concurrency limitations etc). Also, the emphasasis is not on the code, it just provides the basic fail prone functionality to the stack. *One should consider the architectures and architectural patterns and use the CDK code for reference.*

Stacks use various programming languages, but CDK uses only TypeScript. I have found that it is the most suitable, out of available options, for CDK. I can't recommend to use any other language. Main reasons are

- Strong typing, easy intellisense
- Structural (not nominal) typing seems really the way to have the most flexible properties set to constructs

## Bootstrap CDK environment

Bootstrap CDK with your account if that is not yet done. Note, this is not related to your IAM user, but to account that you have access to. It will create a cloudformation stack called CDKToolkit which has a bucket that is used in cloudformation deployments. These are required foor all regions to which you aim to deploy.

To get started, execute

```bash
cdk bootstrap aws://{account}/{region}
```

Notes 
* Some of the stacks use cdk v1 and some cdk v2. v2 requires its own bootstrapping. 
* Do not install cdk globally if you need to use both versions.

## Python virtual environment

In demo walkthroughs we use Python and there are some requirements. It is advisable to create virtual environment. Following commands set it up for you (for MacOS)

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

- You must have AWS CLI 2 installed and configured. CDK is executed with NPX (not necessarily in all stacks) so that the walkthroughs don't get outdated - however, there can be errors with older typescript compilers. Various stacks require various permissions for your deployer IAM user. These are not explictly mentioned. When you see missing permission in deployment (and it fails), go to AWS Console and IAM, create groups and attach correct managed policies to these. Then, add your deployer user to these groups.
- NPM is needed
- Python 3.x is needed

## Currently available stacks

Samples are categorized by the advancedness you need to have (grade)

- Grade 1 (g1 prefix): very basic, start going through these in the order presented below if you are newcomer to AWS and/or CDK. Walkthrough is really fast and focus on the things you don't know yet. After you have looked some of these, create your own designs for some toy case, develop a stack, deploy and enjoy.
- Grade 2 (g2): some simple, but perhaps less used concepts, that might require some more expertise.
- Grade 3 (g3): full microservice architectures or equivalent complexity or a bit more advanced concepts.

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

## Grade 3

### assume-role-for-sqs

To learn:

- SQS and Lambda
- What assumed roles are and how to use them in loosely coupled architectures 

### ecr-lambda

To learn:

- How to deploy lambdas from ECR images (and how to create ECR images)
- Minimum working example of Dockerized python FastAPI

### polyglot-monolith-microservice-ui-jwt-auth

Previous stacks operate with one programming language and if that's not python, there may be some python used in demos. For this following languages / frameworks should be somehow understood. However, I don't know Vue for example, but did this anyway with it.

- ASP.net core (C#)
- FastAPI (Python)
- Vue (TypeScript)

Also, before you start doing this, you should be somewhat comfortable with basic S3 and DynamoDB use. And the concept of token authorization.

To learn:

- ASP.net REST API in Lambda (times 2 in this example)
- Vue SPA via CloudFront
- Using Minio (S3) and DynamoDB locally during development
- JWT auth with various authorizers (currently only custom Lambda implemented)
- Python FastAPI in Lambda (and pydantic for validation)
- EventBridge to send events between Lambdas

_Even though this is in master, it is still work in progress_

## Coming in the future

- EC2
- Kinesis
- Fargate

## Some important commands

Create new project

```bash
mkdir new-project
cd new-project
mkdir cdk
cd cdk
cdk init app --language=typescript
```
