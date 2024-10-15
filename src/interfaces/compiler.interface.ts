export type ExecutionResult = { result: string };

export interface ICreateFile {
  result: string;
  filePath: string;
  file: string;
}

export interface ICompileFile {
  result: string;
}

export interface ICompileRequest {
  sourceCode: string;
  language: languageType;
  fileName: string;
  input: string;
}

export interface IMoveFile {
  result: string;
  sanboxPath: string;
}

export enum languageType {
  PYTHON = "PYTHON",
  C = "C",
  CPP = "CPP",
  JAVA = "JAVA",
}
