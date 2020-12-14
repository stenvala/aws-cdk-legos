# What's here?


- Gets presigned S3 url from lambda 
- Saves json to S3 with the presigned url 
- S3 save triggers lambda that removes file from S3 and saves content to DynamoDB
- Get data via rest api fetches data from DynamoDB and deletes it


## Commands

```bash
npm run init # After clone init all 3rd parties
npm run build # Build application
npm run deploy # Deploy CloudFormation stack
npm run demo # Get presigned url, save file, wait 10 s, get data
npm run destroy # Destroy CloudFormation stack
npm run clear # Clear all local files (build, cdk data, node_modules)
```

Or run all

```bash
npm run all
```
