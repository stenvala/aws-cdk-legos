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
import { IntegratorService } from "./services/integrator.service";

// Configure routes here
app.use("/restapi", routes());

// This is rest handler
export const httpHandler = serverless(app);

// This is the step function handled (invoked when new file is added to S3)
export async function stepFunction(event, context) {  
  console.info("Starting step function");  
  await IntegratorService.S3EventHandler(event, context);
}
