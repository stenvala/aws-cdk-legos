# AWS CDK Legos

This repository has conceptually different aws cdk stacks using various aws services like Lego blocks to do simple and unnecessary things. Everything is really simple: with one command you can go through the whole stack from initialization after clone to destroy and results are displayed in terminal. Many stacks are missing essential things that production grade code requires even though some concepts may have been presented in another, perhaps simpler, stack.

## Prerequisites

- You must have aws cli and cdk installed and configured. Look from web how.
- NPM is needed
- Python 3 is needed

## Currently available stacks

Samples are here in the order in which a newbie might go them through.

### ts-hello-world

To learn:

- Concept for walking through these stacks
- Basic cdk
- Map a typescript function to url
- Environmental variables, event and context available in lambda

### ts-rest-api

To learn:

- Deploy a full typescript based rest api to lambda
- Unit testing of cdk and app
- Running rest api locally during development

### ts-rest-api+s3

To learn:

- Create s3 bucket
- Use s3 bucket

### ts-lambda-to-lambda-with-iam

To learn:

- Add iam based authorization to api gateway
- Use iam authorization in aws inter service communication

### ts-step-function+rest+s3+dynamodb

To learn:

- Create dynamodb table in cdk and authorize lambda to use it
- Use dynamodb
- Trigger lambda by adding file to s3
- Presigning s3 url and saving file to s3 with it

### netcore-monolith-attachment-ms-jwt-auth

This is big step from the previous toy examples and represents a real cloud application with multiple micro services.

To learn:

- Asp.net rest api in lambda (times 2 in this example)
- Vue SPA via CloudFront (I don't know vue, just did something)
- Using Minio (S3) and lambda locally
- JWT auth with various authorizers (currently only custom lambda implemented)
- Python FastAPI lambda

_This is still under progress, but merged to master - just because._

## Coming in the future

### py-rest-api-own-domain

To learn:

- Lambda rest api with python Flask
- Own custom domain name in the lambda

### csharp-ts-async-html2pdf-s3-sns-sqs-communication

- Layers in lambda
- SQS and SNS communication between lambdas

### csharp-asp-net-auth-python-fastapi-ms-svelte-cloudfront

To learn:

- Use one microbackend for authentication, other for business logic
- JWT auth to microservice
- Serving front end with cloudfront
- E2E testing with multi microservice system

### Some ec2 demo

### ...
