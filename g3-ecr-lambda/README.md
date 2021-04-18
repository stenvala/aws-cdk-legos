# What's here?

This demo includes

* Creation of ECR repository
* Pushing lambda image to that
* Deploying a lambda that uses image from the repository

Lambda is made with python and utilises FastAPI.

You need to have docker installed to run this stack.

## Commands

```bash
npm run init # After clone init all 3rd parties
npm run deploy-ecr # Create ECR repository
npm run push-image # Build image and push to repository with unique hashtag (computed from code)
npm run push-image-keep-tag # Push image with tag static-value
npm run deploy-lambda # Deploy lambda with tag based of latests pushed image
npm run all-lambda # Push image and deploy lambda 
npm run demo # run demo scripts
npm run destroy # Destroy CloudFormation stacks (need to manually delete ECR repository from console)
```

Or run init, deploy-ecr, push-image, deploy-lambda, demo, destroy

```bash
npm run all
```