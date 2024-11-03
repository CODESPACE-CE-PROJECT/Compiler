import { Request, Response } from "express";
import { ISubmissionRequest } from "../interfaces/submission.interface";
import { ICompileRequest } from "../interfaces/compiler.interface";
import { rabbitMQService } from "../services/rabbitmq.service";
import { RequestWithUser } from "../interfaces/auth.interface";

export const compilerController = {
  addSubmissionToRabbitMQ: async (req: Request, res: Response) => {
    const submission: ISubmissionRequest = req.body;
    if (!submission) {
      return res.status(404).json({
        message: "Missing Required Fields",
      });
    }
    submission.token = (req as RequestWithUser).user.token;
    await rabbitMQService.sendDataToQueue("submission", submission);
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
    data.token = (req as RequestWithUser).user.token;
    await rabbitMQService.sendDataToQueue("compiler", data);
    return res.status(200).json({
      message: "Add To Queue Successfully",
    });
  },
};
