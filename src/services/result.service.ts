import { languageType } from "../interfaces/compiler.interface";
import { compilerService } from "./compiler.service";

export const resultService = {
  outputResultWithTestCase: async (
    sourceCode: string,
    language: string,
    input: string,
    filename: string,
  ) => {
    try {
    } catch (error) {
      return { result: "error" };
    }
  },
  outputResult: async (
    sourceCode: string,
    language: languageType,
    input: string,
    filename: string,
  ) => {
    try {
      const {
        result: createFileResult,
        filePath,
        file,
      } = await compilerService.createFile(sourceCode, filename, language);
      if (createFileResult !== "") {
        return { result: createFileResult };
      }
      const boxId = process.pid % 1000;
      const { result: moveFileResult, sanboxPath } =
        await compilerService.moveFileToIsolate(filePath, boxId);
      if (moveFileResult !== "") {
        return { result: moveFileResult };
      }
      const { result: resultCompile } = await compilerService.compileFile(
        sanboxPath,
        language,
        file,
      );
      if (resultCompile) {
        return { result: resultCompile };
      }
      const { result: resultRun } = await compilerService.Run(
        boxId,
        language,
        sanboxPath,
        input,
        file,
      );
      await compilerService.removeIsolateByBoxId(boxId);
      return { result: resultRun };
    } catch (error) {
      return { result: error };
    }
  },
};
