# What's here?

This creates following flow

- Get presigned S3 url from lambda -> Save json to S3 to the presigned url -> S3 save triggers lambda that removes file from S3 and saves content to DynamoDB
- Get data fetches data from DynamoDB and deletes it

# Initialize

```bash
npm run init
```

# Build and deploy

```bash
npm run build && npm run deploy
```


# Try deployed api

```bash
cd client
python3 demo.py -method post
python3 demo.py -method get
```

# Destroy

```bash
npm run destroy
```