export interface ITestCase {
  message: string;
  data: {
    testCases: {
      testCaseId: string,
      input: string;
      output: string;
      isHidden: boolean;
    }[],
    constraint: {
      constraintId: string,
      type: ConstraintType,
      keyword: string,
      qunatities: number,
      problemId: string
    }[]
  };
}

export enum ConstraintType {
  FUNCTION = "FUNCTION",
  METHOD = "METHOD",
}
