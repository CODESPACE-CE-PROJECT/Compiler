import { Request, Response } from "express";
import strip from "strip-comments"
import tress from "tress"
import { resultService } from "../services/result.service";
import { ExecutionResult } from "../interfaces/compiler.interface";




const queue = tress((req: any, next: any) => {
  try {
    compiler(req.body).then((result) => {next(null, result)});
  } catch (error) {
    console.log((error as Error).message);
  }
})

export const add_request_to_queue = async (req: Request, res: Response) => {
  try {
    queue.push(req as any)
    queue.success = function(data) {
      res.status(200).json({
        message: "REQUEST_ADD_TO_QUEUE",
        data: data.result
      })
    }
  } catch (error) {
    res.status(304).json({
      message: "FAILED_TO_ADDED_TO_QUEUE",
    })
  }
}

const compiler = async ({ sourceCode, language }: { sourceCode: string; language: string }) => {
  try {
    const updatedSourceCode = strip(sourceCode);
    // console.log(updatedSourceCode)

    const result = await resultService.outputResult(updatedSourceCode);
    return result.result;
  } catch (error) {
    console.log((error as Error).message);
  }
}
