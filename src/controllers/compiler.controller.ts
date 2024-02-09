import { Request, Response } from "express";
import strip from "strip-comments"
import tress from "tress"
import { resultService } from "../services/result.service";


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
        message: "Process Success",
        data: data.result
      })
    }
  } catch (error) {
    res.status(304).json({
      message: "Process Failed",
    })
  }
}

const compiler = async ({ sourceCode, language , input, fileName}: { sourceCode: string; language: string, input:string, fileName:string}) => {
  try {
    const updatedSourceCode = strip(sourceCode);

    const result = await resultService.outputResult(updatedSourceCode, language,input, fileName);
    return result.result;
  } catch (error) {
    console.log((error as Error).message);
  }
}
