# What's here?

Very basic cdk stack with Lambda and API gateway.
Lambda returns message and information about event that triggered it and environment.

![plot](../sketches/only-lambda.png)

# Commands

```bash
npm run init # After clone init all 3rd parties
npm run build # Build application
npm run deploy # Deploy CloudFormation stack
npm run demo # Make http request to lambda (via api gw) and display response
npm run destroy # Destroy CloudFormation stack
npm run clean # Clear all local files (build, cdk data, node_modules)
```

Or run all

```bash
npm run all
```
