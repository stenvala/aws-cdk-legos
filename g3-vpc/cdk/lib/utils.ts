import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib";

export interface AddToParameterStoreProps {
  id: string;
  description?: string;
  parameterName: string;
  stringValue: string;
}

export function addToParameterStore(
  stack: cdk.Stack,
  props: AddToParameterStoreProps
) {
  new ssm.StringParameter(stack, props.id, {
    allowedPattern: ".*",
    description: props.description || "",
    parameterName: props.parameterName,
    stringValue: props.stringValue,
    tier: ssm.ParameterTier.STANDARD,
  });
}
