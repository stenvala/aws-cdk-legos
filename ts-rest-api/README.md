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

# Destroy

```bash
cd cdk
cdk destroy
```

# Try api locally

```bash
cd client
python3 demo.py
python3 demo.py -method post
```

# Try deployed api

```bash
cd client
python3 demo.py -region {aws-region} -uid {aws-uid}
python3 demo.py -region {aws-region} -uid {aws-uid} -method post
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
