import { compilerService } from "./compiler.service";

export const resultService = {
  outputResult: async (sourceCode: string) => {
    try {
      const { result: createFileResult, filePath } = await compilerService.createFile(sourceCode, `${process.pid}`);
      if (createFileResult !== "") {
        return { result: createFileResult };
      }
      const { result: compileFileResult, executablePath } = await compilerService.compileFile(filePath);

      if (compileFileResult !== "") {
        return { result: compileFileResult }
      }
      const result = await compilerService.Run(executablePath, "1.0023");
      return { result };
    } catch (error) {
      return { result: "error" }
    }
  }
}
