# What's here?

This creates two lambdas and one passes message to other one via SQS. The interesting thing is that the SQS istance is completely unknown by REST API lambda.

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
