#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/stack";

const app = new cdk.App();
new CdkStack(app, "anttiste-Neptune", {
  env: {
    // Account data is required by lookup access to parameter store
    region: "eu-west-1",
    account: "381639583452",
  },
});
