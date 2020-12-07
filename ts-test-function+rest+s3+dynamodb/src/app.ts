const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");

const app = new express();

const bodyParser = require("body-parser");

app.use(bodyParser.json({ limit: "6mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

const options = {
  origin: "*",
};

app.use(cors(options));

import { routes } from "./routes/routes";

// Configure routes here
app.use("/restapi", routes());

// This is our lambda handler
export const httpHandler = serverless(app);

export async function stepFunction(event, context) {
  // This is the step function
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/json" },
    body: JSON.stringify({
      msg: "Hello world!",
      event,
      context,
      env: process.env,
    }),
  };
}

// This is needed for local
export const localApp = app;
