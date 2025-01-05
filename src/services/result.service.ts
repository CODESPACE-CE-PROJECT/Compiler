import { languageType } from "../interfaces/compiler.interface";
import { ISubmissionLearnify, ISubmissionRequest } from "../interfaces/submission.interface";
import { ITestCase } from "../interfaces/testcase.interface";
import { testCaseUtils } from "../utils/testcase.util";
import { compilerService } from "./compiler.service";

export const resultService = {
  outputResultWithTestCase: async (
    submission: ISubmissionRequest,
    testcases: ITestCase,
  ) => {
    try {
      const {
        result: createFileResult,
        filePath,
        file,
      } = await compilerService.createFile(
        submission.sourceCode,
        submission.fileName,
        submission.language,
      );
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
        submission.language,
        file,
      );
      if (resultCompile) {
        return { result: resultCompile };
      }

      const inputs = testCaseUtils.input(testcases);
      const expectedOutputs = testCaseUtils.output(testcases);
      if (inputs.length !== expectedOutputs.length) {
        return { result: "TestCase Error" };
      }
      const executionResults = await Promise.all(
        inputs.map(async (input: string) => {
          return await compilerService.Run(
            boxId,
            submission.language,
            sanboxPath,
            input,
            file,
          );
        }),
      );
      const resultProblem = await compilerService.generateReusltProblem(
        expectedOutputs,
        executionResults,
      );
      await compilerService.removeIsolateByBoxId(boxId);
      return resultProblem;
    } catch (error) {
      console.log(error);
      return { result: "error" };
    }
  },

  outputResultWithTestCaseLeanify: async (
    submission: ISubmissionLearnify,
  ) => {
    try {
      const {
        result: createFileResult,
        filePath,
        file,
      } = await compilerService.createFile(
        submission.sourceCode,
        submission.fileName,
        submission.language,
      );
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
        submission.language,
        file,
      );
      if (resultCompile) {
        return { result: resultCompile };
      }

      const inputs = submission.testCases.map((testcase) => testcase.input);
      const expectedOutputs = submission.testCases.map((testcase) => testcase.expectedOutput);
      if (inputs.length !== expectedOutputs.length) {
        return { result: "TestCase Error" };
      }
      const executionResults = await Promise.all(
        inputs.map(async (input: string) => {
          return await compilerService.Run(
            boxId,
            submission.language,
            sanboxPath,
            input,
            file,
          );
        }),
      );
      const resultProblem = await compilerService.generateReusltProblem(
        expectedOutputs,
        executionResults,
      );
      await compilerService.removeIsolateByBoxId(boxId);
      return resultProblem;
    } catch (error) {
      console.log(error);
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
