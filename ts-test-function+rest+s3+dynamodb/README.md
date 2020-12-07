# What's here?

This creates following flow

- Get presigned S3 url from lambda -> Save json to S3 to the presigned url -> S3 save triggers lambda that removes file from S3 and saves content to DynamoDB
- Get data fetches data from DynamoDB and deletes it

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
