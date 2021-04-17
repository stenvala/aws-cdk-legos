# What's here?

This creates two lambdas and one passes message to other one via SQS. The interesting thing is that the SQS instance is completely unknown by REST API lambda, but the Microservice 2 allows Microservice 1 to send messages to it's SQS. Microservice 1 can assume roles and Microservice 2 creates a role hat has permissions to send message. Then this role is assumed in Microservice 1. RoleArn and Queue Url is sent in post request to Microservice 1.

![plot](../sketches/sqs-assume-architecture.png)

## Commands

```bash
npm run init # After clone init all 3rd parties
npm run build # Build applications
npm run deploy # Deploy CloudFormation stacks
npm run demo # Make http request to rest lambda
npm run destroy # Destroy CloudFormation stacks
```

Or run init, build, test, deploy, demo

```bash
npm run all
```
