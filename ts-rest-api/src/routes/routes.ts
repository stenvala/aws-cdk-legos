import { IntegratorService } from "../services/integrator.service";

const express = require("express");

function getIntegrator() {
  return new IntegratorService();
}
export function routes() {
  const router = express.Router();

  router.route("/endpoint").get(async (req, res, next) => {
    res.send(await getIntegrator().getHelloWorld());
    next();
  });

  router.route("/endpoint").post(async (req, res, next) => {
    res.send(await getIntegrator().postHelloWorld(req.body));
    next();
  });

  return router;
}
