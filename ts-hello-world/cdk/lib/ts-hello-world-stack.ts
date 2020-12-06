import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";

export class TsHelloWorldStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const name = new lambda.Function(this, "HelloWorldHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.lambdaHandler",
    });

    // API Gateway
    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: name,
      proxy: true,
    });
    /*
    const queue = new sqs.Queue(this, 'TsHelloWorldQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const topic = new sns.Topic(this, 'TsHelloWorldTopic');

    topic.addSubscription(new subs.SqsSubscription(queue));
    */
  }
}
