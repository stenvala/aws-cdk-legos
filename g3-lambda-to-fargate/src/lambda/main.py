import boto3
import os


def handler(event, context):
    client = boto3.client("ecs")
    response = client.run_task(
        cluster=os.environ["CLUSTER_NAME"],
        launchType="FARGATE",
        taskDefinition=os.environ["TASK_DEFINITION_ARN"],
        count=1,
        platformVersion="LATEST",
        networkConfiguration={
            "awsvpcConfiguration": {
                "subnets": os.environ["SUBNETS"].split(","),
                "securityGroups": [os.environ["SECURITY_GROUP"]],
                "assignPublicIp": "ENABLED",
            }
        },
        overrides={
            "containerOverrides": [
                {
                    "name": os.environ[
                        "CONTAINER_NAME"
                    ],  # Updated in this container
                    "environment": [
                        {"name": "MY_INPUT_1", "value": "My value"}
                    ],
                }
            ]
        },
    )
    """
        overrides={
            "containerOverrides": [
                {"environment": [{"name": "MY_INPUT_1", "value": "My value"}]}
            ]
        },
    """
    print(response)
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "text/plain"},
        "body": "OK",
    }
