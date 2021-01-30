#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { CdkStack } from "../lib/cdk-stack";

const app = new cdk.App();
new CdkStack(app, "G2-TSLambda2Lambda1-Stack");
