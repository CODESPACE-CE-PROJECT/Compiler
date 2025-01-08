import { Router } from "express";
import { compilerController } from "../controllers/compiler.controller";
import { authorization, authorizationAPIKey } from "../middlewares/auth.middleware";
const router = Router();


router.post(
  "/submission",
  authorization,
  compilerController.addSubmissionToRabbitMQ,
);

router.post("/compiler", authorization, compilerController.compilerCode);

router.post("/submission/learnify", authorizationAPIKey, compilerController.compilerCodeLearnify)

export { router as compilerRouter };
