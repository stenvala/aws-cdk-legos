#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support/register";
import { CdkLambdaStack } from "../lib/cdk-lambda-stack";

const app = new cdk.App();
new CdkLambdaStack(app, "G3-ECRLambda-Lambda");
