# What's here?

Very basic CRUD application with asp.net rest api and serverless Aurora
Lambda returns message and information about event that triggered it and environment.

This is based on
```bash
dotnet new -i "Amazon.Lambda.Templates::*"
dotnet new lambda --list
dotnet new serverless.AspNetCoreWebAPI 
mkdir cdk
cd cdk
cdk init sample-app --language=csharp
```


# Some useful links

* [https://github.com/aws/aws-lambda-dotnet](https://github.com/aws/aws-lambda-dotnet)
* (https://github.com/aws-samples/aws-cdk-examples/tree/nija-at/c%23-lambda/csharp/capitalize-string)