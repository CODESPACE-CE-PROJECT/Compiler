import { compilerService } from "./compiler.service";

export const resultService = {
  outputResult: async (sourceCode: string, language: string, input: string, filename: string) => {
    try {
      if(language !== "java") {filename = `${process.pid}`}
      const { result: createFileResult, filePath } = await compilerService.createFile(sourceCode, filename, language);
      if (createFileResult !== "") {
        return { result: createFileResult };
      }
      if (language === "c" || language === "cpp" || language === "java"){
        const { result: compileFileResult, executablePath } = await compilerService.compileFile(filePath, language);

        if (compileFileResult !== "") {
          return { result: compileFileResult }
        }
        const result = await compilerService.Run(executablePath, language,input,filename);
        return { result };
     }else{
        const result = await compilerService.Run(filePath, language ,input,filename);
        return {result};
     }
    } catch (error) {
      return { result: "error" }
    }
  }
}
