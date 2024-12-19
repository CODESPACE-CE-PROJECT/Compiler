import { languageType } from "./compiler.interface";

export interface ISubmissionRequest {
  problemId: string;
  sourceCode: string;
  language: languageType;
  fileName: string;
  token?: string;
  username?: string
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
  stateSubmission: string;
}

export interface IResultSubmission {
  message: string;
  data: {
    submissionId: string;
    problemId: string;
    username: string;
    sourceCode: string;
    no: number;
    results: {
      output: string;
      isPass: boolean;
    }[];
    stateSubmission: boolean;
    createAt: Date;
  }
}

