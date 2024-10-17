import { ITestCase } from "../interfaces/testcase.interface";

export const testCaseUtils = {
  input: (testcases: ITestCase): string[] =>
    testcases.data.map((testcase) => testcase.input),
  output: (testcases: ITestCase): string[] =>
    testcases.data.map((testcase) => testcase.output),
  checkOutputEquality: (
    expectedOutput: string,
    executionResult: string,
  ): boolean => {
    try {
      const userLines = executionResult.trimEnd().split(/\r?\n/);
      const testcaseLines = expectedOutput.trimEnd().split(/\r?\n/);

      if (userLines.length !== testcaseLines.length) {
        return false;
      }

      for (let i = 0; i < userLines.length; i++) {
        if (userLines[i].trimEnd() !== testcaseLines[i].trimEnd()) {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  },
};
