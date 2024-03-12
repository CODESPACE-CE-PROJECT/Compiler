import { Request, Response } from "express";
import tress from 'tress'
import { terminalService } from "../services/terminal.service";

const queue = tress((req: any, next: any) => {
    try {
        compiler(req.body).then((result) => {next(null, result)});
    } catch (error) {
        console.log((error as Error).message)
    }
})


export const add_request_to_queue_terminal = async (req: Request, res: Response) => {
    try {
        queue.push( req as any )
        queue.success = function(data) {
            res.status(200).json({
                message: "Process Success"
            })
        }
    } catch (error) {
        res.status(304).json({
            message: "Process Failed",
        })
    }
}

const compiler = async ({container_id, sourceCode, language, fileName}: {container_id: string, sourceCode: string; language: string; fileName: string}) => {
    try {
        const result = await terminalService.compilerAndRun(container_id,sourceCode, language,fileName)
        return result
    } catch (error) { 
        console.log((error as Error).message)
    }
}