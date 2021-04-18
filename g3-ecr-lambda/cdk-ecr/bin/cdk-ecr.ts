#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support/register";
import { CdkEcrStack } from "../lib/cdk-ecr-stack";

const app = new cdk.App();
new CdkEcrStack(app, "G3-ECRLambda-ECR");
