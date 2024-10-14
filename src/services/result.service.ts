import { languageType } from "../interfaces/compiler.interface";
import { compilerService } from "./compiler.service";

export const resultService = {
  //outputResultWithTestCase: async (
  //  sourceCode: string,
  //  language: string,
  //  input: string,
  //  filename: string,
  //) => {
  //  try {
  //    if (language !== "java") {
  //      filename = `${process.pid}`;
  //    }
  //    const { result: createFileResult, filePath } =
  //      await compilerService.createFile(
  //        sourceCode,
  //        `${process.pid}`,
  //        language,
  //      );
  //    if (createFileResult !== "") {
  //      return { result: createFileResult };
  //    }
  //    if (language === "c" || language === "cpp" || language === "java") {
  //      const { result: compileFileResult, executablePath } =
  //        await compilerService.compileFile(filePath, language);
  //
  //      if (compileFileResult !== "") {
  //        return { result: compileFileResult };
  //      }
  //      const result = await compilerService.Run(
  //        executablePath,
  //        language,
  //        input,
  //        filename,
  //      );
  //      return { result };
  //    } else {
  //      const result = await compilerService.Run(
  //        filePath,
  //        language,
  //        input,
  //        filename,
  //      );
  //      return { result };
  //    }
  //  } catch (error) {
  //    return { result: "error" };
  //  }
  //},
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
        return;
      }
      const boxId = Math.floor(Math.random() * 1000);
      const { result: moveFileResult, sanboxPath } =
        await compilerService.moveFileToIsolate(filePath, boxId);
      if (moveFileResult !== "") {
        return;
      }
      await compilerService.compileFile(sanboxPath, language, file);
    } catch (error) {}
  },
};
