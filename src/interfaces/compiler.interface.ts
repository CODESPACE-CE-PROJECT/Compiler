export type ExecutionResult = { result: string }

export interface ICreateFile {
  result: string;
  filePath: string;
}

export interface ICompileFile {
  result: string;
  executablePath: string;
}
