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
cdk deploy
cd ..
cd cdk2
npm install
cdk deploy
```

# Test at

```
https://{uid}.execute-api.{region}.amazonaws.com/prod/
```

(URL is revealed at the time of deploy)

# Clear stack

```bash
cd cdk1
cdk destroy
cd cdk2
cdk destroy
```
