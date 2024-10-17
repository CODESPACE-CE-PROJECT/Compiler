import { languageType } from "./compiler.interface";

export interface ISubmissionRequest {
  problemId: string;
  sourceCode: string;
  language: languageType;
  fileName: string;
  token?: string;
}

export interface IResultProblem {
  output: string;
  isPass: boolean;
}

export interface ISubmission {
  problemId: string;
  sourceCode: string;
  results: {
    output: string;
    isPass: boolean;
  }[];
  status: boolean;
}
