# What's here

This creates lambda that returns message, request and context information for you to look.

# Build

```bash
cd src
tsc app.ts ; mv app.js ../dist/
```

# Deploy

```bash
cd cdk
cdk deploy
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
