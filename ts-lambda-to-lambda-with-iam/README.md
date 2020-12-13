# What's here?

This creates two lambdas you send message to first, it forwards it to next using iam role as authenticator and returns the message

# Build

```bash
cd src
npm install
tsc app.ts
```

# Deploy

```bash
cd cdk1
npm install
cdk deploy --outputs-file output.json
cd ..
cd cdk2
npm install
cdk deploy --outputs-file output.json
cd ..
cd cdk1
cdk deploy --outputs-file output.json
```

At the first time the first lambda must be deployed twice to have the url of the second lambda as environment variable

# Clear stacks

First for stack 1 you need to delete stack 2 created policy manually from console

```bash
cd cdk1
cdk destroy
cd cdk2
cdk destroy
```
