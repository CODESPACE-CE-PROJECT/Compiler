import { languageType } from "./compiler.interface";

export interface ISubmission {
  problemId: string;
  sourceCode: string;
  language: languageType;
}
