import { Router } from "express";
import { compilerController } from "../controllers/compiler.controller";
import { authorization } from "../middlewares/auth.middleware";
const router = Router();

/**
 * @openapi
 * /compiler/submission:
 *   post:
 *     tags:
 *       - Compiler
 *     summary: Submission of code to RabbitMQ (Student, Teacher)
 *     description: This endpoint submits the code to a RabbitMQ queue.
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *           schema:
 *             type: object
 *             properties:
 *               problemId:
 *                 type: string
 *                 description: The ID of the problem to which the code is submitted
 *               sourceCode:
 *                 type: string
 *                 description: The source code to be submitted
 *               language:
 *                 type: string
 *                 description: The programming language of the source code
 *             required:
 *               - problemId
 *               - sourceCode
 *               - language
 *        application/x-www-form-urlencoded:
 *            schema:
 *             type: object
 *             properties:
 *               problemId:
 *                 type: string
 *                 description: The ID of the problem to which the code is submitted
 *               sourceCode:
 *                 type: string
 *                 description: The source code to be submitted
 *               language:
 *                 type: string
 *                 description: The programming language of the source code
 *               fileName:
 *                 type: string
 *             required:
 *               - problemId
 *               - sourceCode
 *               - language
 *     responses:
 *       200:
 *         description: Successfully added to queue
 */

router.post("/submission", compilerController.addSubmissionToRabbitMQ);

/**
 * @openapi
 * /compiler:
 *   post:
 *     tags:
 *       - Compiler
 *     summary: Compiler Code (Student, Teacher)
 *     description: Compiler Code to RabbitMQ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sourceCode:
 *                 type: string
 *               language:
 *                 type: string
 *               fileName:
 *                 type: string
 *             required:
 *               - sourceCode
 *               - language
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               sourceCode:
 *                 type: string
 *               language:
 *                 type: string
 *               fileName:
 *                 type: string
 *             required:
 *               - sourceCode
 *               - language
 *               - fileName
 *     responses:
 *       200:
 *         description: Successfully added to queue
 */
router.post("/", authorization, compilerController.compilerCode);

export { router as compilerRouter };
