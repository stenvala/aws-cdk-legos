#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { Lambda1Stack } from "../lib/cdk-stack";

const app = new cdk.App();
new Lambda1Stack(app, "Lambda2LambdaPart1");
