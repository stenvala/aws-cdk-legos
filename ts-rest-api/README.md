# What's here?

This creates lambda rest api with express

# Develop locally

```bash
npm run start
```

# Build

```bash
npm run build
```

# Deploy

```bash
cd cdk
cdk deploy
```

# Test api

```bash
cd client
python3 demo.py
python3 demo.py -g post
```

# Run tests

```bash
cd src
npx jest --watch
```

# Check test coverage

```bash
cd src
npx jest --collect-coverage
```
