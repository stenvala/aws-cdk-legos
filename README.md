# AWS CDK Legos

This repository has various conceptually different aws cdk stacks using various aws services like Lego blocks to do simple and unnecessary things. Everything is really simple: with one command you can go the whole stack through from initialization to destroy and results are displayed in terminal.

## Prerequisites

* You must have aws cli installed and configured and aws cdk installed. Look from web how. 
* NPM is needed
* Python 3 is needed

## Fully functional

Samples are here in the order in which a newbie might go them through.

### ts-hello-world

To learn
* Concept for these demos
* Basic cdk
* Map a typescript function to web URL
* Environmental variables, event and context available in lambda

### ts-rest-api

To learn: 
* Deploy a full typescript based rest api to lambda
* Unit testing of cdk and app
* Running rest api locally during development

### ts-rest-api+s3

To learn:
* Create s3 bucket with cdk
* Use s3 bucket

### ts-lambda-to-lambda-with-iam

To learn:
* Add iam based authorization to api gateway with cdk
* Use iam authorization in aws inter service communication

## Workflow to be done

### ts-step-function+rest+s3+dynamodb

To learn:
* Create dynamodb table in cdk and authorize lambda to use it
* Use dynamodb
* Trigger lambda by adding file to s3
* Presigning s3 url

## Coming

### py-rest-api-own-domain

To learn:
* Lambda rest with python Flask
* Own custom domain name in the lambda

### csharp-asp-net-serverless-aurora

To learn:
* Asp.net rest api in lambda
* Serverless RDBS 

### ts-csharp-async-ts-html2pdf-s3-sns-sqs-communication

* Layers in lambda
* SQS and SNS communication between lambdas

### csharp-asp-net-auth-python-fastapi-ms-svelte-cloudfront

To learn:
* Use one microbackend for authentication, other for business logic
* JWT auth to microservice
* Serving front end with cloudfront

### Some ec2 demo

### ...