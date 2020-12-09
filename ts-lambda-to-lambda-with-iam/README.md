# What's here?

This creates two lambdas you send message to first, it forwards it to next using iam role as authenticator and returns the message

# Build

```bash
cd src
tsc app.ts ; mv app.js ../dist/
```

# Deploy

```bash
cd cdk1 && cdk deploy && cd ../cdk2 && cdk deploy && cd ..

```

# Test at

```
https://{uid}.execute-api.{region}.amazonaws.com/prod/
```

(URL is revealed at the time of deploy)

# Clear stack

```bash
cd cdk
cdk destroy
```
