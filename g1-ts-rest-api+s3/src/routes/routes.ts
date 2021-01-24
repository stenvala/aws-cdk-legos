import { IntegratorService } from "../services/integrator.service";
import { S3Service } from "../services/s3.service";

const express = require("express");

function getIntegrator() {
  const s3 = new S3Service();
  return new IntegratorService(s3);
}
export function routes() {
  const router = express.Router();

  router.route("/:path").get(async (req, res, next) => {
    res.send(await getIntegrator().getFile(req.params.path));
    next();
  });

  router.route("/:path").delete(async (req, res, next) => {
    res.send(await getIntegrator().removeFile(req.params.path));
    next();
  });

  router.route("").post(async (req, res, next) => {
    res.send(await getIntegrator().addFile(req.body));
    next();
  });

  return router;
}
