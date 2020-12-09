import { DynamoService } from "../services/dynamo.service";
import { IntegratorService } from "../services/integrator.service";
import { S3Service } from "../services/s3.service";

const express = require("express");

function getIntegrator() {
  const s3 = new S3Service();
  const dynamo = new DynamoService();
  return new IntegratorService(s3, dynamo);
}

// Inspired by: https://advancedweb.hu/how-to-use-s3-post-signed-urls/

export function routes() {
  const router = express.Router();

  router.route("").get(async (req, res, next) => {
    res.send(await getIntegrator().getPresignedUrl());
    next();
  });

  router.route("/:path").get(async (req, res, next) => {
    res.send(await getIntegrator().getData(req.params.path));
    next();
  });

  return router;
}
