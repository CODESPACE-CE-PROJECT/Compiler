import { Router } from "express";
import { compilerController } from "../controllers/compiler.controller";
import { authorization } from "../middlewares/auth.middleware";
const router = Router();


router.post(
  "/submission",
  authorization,
  compilerController.addSubmissionToRabbitMQ,
);

router.post("/", authorization, compilerController.compilerCode);

export { router as compilerRouter };
