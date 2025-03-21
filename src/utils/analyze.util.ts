import { languageType } from "../interfaces/compiler.interface";
import { ISubmissionRequest } from "../interfaces/submission.interface";
import { ConstraintType, ITestCase } from "../interfaces/testcase.interface";
import { problemService } from "../services/problem.service";

export const analyzeCode = async (submission: ISubmissionRequest) => {
  let functionRegex: RegExp;
  let importRegex: RegExp;

  const testCase: ITestCase = await problemService.getTestCases(
    submission.problemId,
    submission.token,
  );

  const targetFunctions: string[] = testCase.data.constraint.flatMap((item) =>
    item.type === ConstraintType.FUNCTION ? [item.keyword] : [],
  );

  const targetImports: string[] = testCase.data.constraint.flatMap((item) =>
    item.type === ConstraintType.CLASS ? [item.keyword] : [],
  );

  switch (submission.language) {
    case languageType.PYTHON:
      functionRegex = new RegExp(
        `\\b(${targetFunctions.join("|")})\\s*\\(`,
        "g",
      );
      importRegex = /^(?:import\s+(\w+)|from\s+(\w+)\s+import)/gm;
      break;
    case languageType.C:
    case languageType.CPP:
      functionRegex = new RegExp(
        `\\b(${targetFunctions.join("|")})\\s*\\(`,
        "g",
      );
      importRegex = /^#include\s*[<"]([^">]+)[>"]/gm;
      break;
    case languageType.JAVA:
      functionRegex = new RegExp(
        `\\b(${targetFunctions.join("|")})\\s*\\(`,
        "g",
      );
      importRegex = /^import\s+([\w.*]+);/gm;
      break;
    default:
      throw new Error("Unsupported language!");
  }

  const functionMatches = [
    ...submission.sourceCode.matchAll(functionRegex),
  ].map((match) => match[1]);

  const importMatches = [...submission.sourceCode.matchAll(importRegex)]
    .map((match) => match[1] || match[2])
    .filter((importName) => targetImports.includes(importName));

  return {
    functions: functionMatches,
    imports: importMatches,
  };
};
