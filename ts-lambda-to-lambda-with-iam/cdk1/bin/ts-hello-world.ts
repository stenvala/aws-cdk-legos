#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { TsHelloWorldStack } from "../lib/ts-hello-world-stack";

const app = new cdk.App();
new TsHelloWorldStack(app, "Lambda2LambdaPart1");
