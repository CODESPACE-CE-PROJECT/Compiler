import { compilerService } from "./compiler.service";

export const resultService = {
  outputResult: async (sourceCode: string, language: string, input: string) => {
    try {
      const { result: createFileResult, filePath } = await compilerService.createFile(sourceCode, `${process.pid}`, language);
      if (createFileResult !== "") {
        return { result: createFileResult };
      }
      if (language === "c" || language === "cpp"){
        const { result: compileFileResult, executablePath } = await compilerService.compileFile(filePath, language);

        if (compileFileResult !== "") {
          return { result: compileFileResult }
        }
        const result = await compilerService.Run(executablePath, language,input);
        return { result };
     }else{
        const result = await compilerService.Run(filePath, language ,input);
        return {result};
     }
    } catch (error) {
      return { result: "error" }
    }
  }
}
