import { Request, Response } from "express";
import { ISubmission } from "../interfaces/submission.interface";
import { ICompileRequest } from "../interfaces/compiler.interface";
import { rabbitMQService } from "../services/rabbitmq.service";

export const compilerController = {
  addSubmissionToRabbitMQ: async (req: Request, res: Response) => {
    const submission: ISubmission = req.body;
    if (!submission) {
      return res.status(404).json({
        message: "Missing Required Fields",
      });
    }
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
    await rabbitMQService.sendDataToQueue("compiler", data);
    return res.status(200).json({
      message: "Add To Queue Successfully",
    });
  },
};
