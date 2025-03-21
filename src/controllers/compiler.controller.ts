import { Request, Response } from "express";
import {
  ISubmissionLearnify,
  ISubmissionRequest,
} from "../interfaces/submission.interface";
import { ICompileRequest } from "../interfaces/compiler.interface";
import { rabbitMQService } from "../services/rabbitmq.service";
import { RequestWithUser } from "../interfaces/auth.interface";
import { redisClient } from "../services/redis.service";
import { analyzeCode } from "../utils/analyze.util";

export const compilerController = {
  addSubmissionToRabbitMQ: async (req: Request, res: Response) => {
    const submission: ISubmissionRequest = req.body;
    if (!submission) {
      return res.status(404).json({
        message: "Missing Required Fields",
      });
    }

    submission.token = (req as RequestWithUser).user.token;
    submission.username = (req as RequestWithUser).user.username;
    const resultAnalyzeCode = await analyzeCode(submission);
    if (
      resultAnalyzeCode.imports.length > 0 ||
      resultAnalyzeCode.functions.length > 0
    ) {
      return res.status(406).json({
        message: "Has Constraint In Your Code",
        data: resultAnalyzeCode,
      });
    }
    await rabbitMQService.sendDataToQueue("submission", submission);

    redisClient.set(`submissionState-${submission.username}`, "true", {
      EX: 240,
    });

    return res.status(200).json({
      message: "Add To Queue Successfully",
    });
  },
  compilerCode: async (req: Request, res: Response) => {
    const data: ICompileRequest = req.body;
    if (!data) {
      return res.status(404).json({
        message: "Missing Required Fields",
      });
    }
    data.username = (req as RequestWithUser).user.username;
    await rabbitMQService.sendDataToQueue("compiler", data);
    return res.status(200).json({
      message: "Add To Queue Successfully",
    });
  },
  compilerCodeLearnify: async (req: Request, res: Response) => {
    const data: ISubmissionLearnify = req.body;
    // check valid user in learnify database
    await rabbitMQService.sendDataToQueue("learnify-submission", data);
    return res.status(200).json({
      message: "Add To Queue Successfully",
    });
  },
};
