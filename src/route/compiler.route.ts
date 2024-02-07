import { Router } from "express";
import { add_request_to_queue } from "../controllers/compiler.controller";

const router = Router();

router.get('/sample', (req, res) => {
  res.send("Sample")
})

router.post('/', add_request_to_queue);

export { router as compilerRouter };

