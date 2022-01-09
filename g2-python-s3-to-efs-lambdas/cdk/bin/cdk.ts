#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";

const app = new App();
new CdkStack(app, "G2-PythonLambdaAndS3toEFS-Stack");
