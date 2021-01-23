#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as fs from "fs";
import { CdkStack } from "../lib/cdk-stack";
import { GlobalProps } from "../lib/models";

let rawdata = fs.readFileSync("props.json");
const props: GlobalProps = JSON.parse(rawdata.toString("utf-8"));

const app = new cdk.App();
new CdkStack(app, "Stack", props);
