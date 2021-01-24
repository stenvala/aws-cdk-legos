#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support/register";
import { CdkStack } from "../lib/cdk-stack";

const app = new cdk.App();
new CdkStack(app);
