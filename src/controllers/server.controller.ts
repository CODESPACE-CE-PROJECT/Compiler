import { Request, Response } from "express";

export const initServer = async (_req: Request, res: Response) => {
  res
    .status(200)
    .send("CEPP Programming Coding Space")
}
