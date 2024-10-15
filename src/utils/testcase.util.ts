import { ITestCase } from "../interfaces/testcase.interface";

export const testCaseUtils = {
  input: (testcases: ITestCase[]): string[] =>
    testcases.map((testcase) => testcase.input),
  output: (testcases: ITestCase[]): string[] =>
    testcases.map((testcase) => testcase.output),
  checkOutputEquality: (): boolean => {
    return false;
  },
};
