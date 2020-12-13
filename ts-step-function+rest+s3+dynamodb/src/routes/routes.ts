import { DynamoService } from "../services/dynamo.service";
import { IntegratorService } from "../services/integrator.service";
import { S3Service } from "../services/s3.service";

const express = require("express");

export function getIntegrator() {
  const s3 = new S3Service();
  const dynamo = new DynamoService();
  return new IntegratorService(s3, dynamo);
}

export function routes() {
  const router = express.Router();

  router.route("/presign").get(async (req, res, next) => {
    res.send(await getIntegrator().getPresignedUrl());
    next();
  });

  router.route("/data/:path").get(async (req, res, next) => {
    res.send(await getIntegrator().getData(req.params.path));
    next();
  });

  return router;
}
