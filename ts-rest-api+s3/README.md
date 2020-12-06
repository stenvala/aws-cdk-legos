# What's here?

This creates lambda rest api with express that can be used to CRUD json data in S3.

# Develop locally

(Not yet solved how to wire this to minio, so in principle it doesn't work)

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

NOTE! S3 bucket must be empty. Otherwise that phase will fail and you need to delete it manually.

```bash
cd cdk
cdk destroy
```

# Try api locally

```bash
cd client
python3 demo.py -method get
python3 demo.py -method post
python3 demo.py -method delete
```

# Try deployed api

```bash
cd client
python3 demo.py -region {aws-region} -uid {aws-uid} -method get
python3 demo.py -region {aws-region} -uid {aws-uid} -method post
python3 demo.py -region {aws-region} -uid {aws-uid} -method delete
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
