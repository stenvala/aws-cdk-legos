#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";

const app = new App();
new CdkStack(app, "G1-TSLambdaAndS3-Stack");
