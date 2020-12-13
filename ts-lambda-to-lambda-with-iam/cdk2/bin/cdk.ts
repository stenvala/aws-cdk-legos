#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { Lambda2Stack } from "../lib/cdk-stack";

const app = new cdk.App();
new Lambda2Stack(app, "Lambda2LambdaPart2");
