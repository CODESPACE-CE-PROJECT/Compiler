import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {
  ExecutionResult,
  ICompileFile,
  ICreateFile,
  IMoveFile,
  languageType,
} from "../interfaces/compiler.interface";
import { IResultProblem } from "../interfaces/submission.interface";
import { testCaseUtils } from "../utils/testcase.util";
export const compilerService = {
  createFile: async (
    sourceCode: string,
    fileName: string,
    language: languageType,
  ): Promise<ICreateFile> => {
    try {
      const folderName =
        language === languageType.C
          ? "c"
          : language === languageType.CPP
            ? "cpp"
            : language === languageType.PYTHON
              ? "python"
              : language == languageType.JAVA
                ? "java"
                : "";
      const languagetype =
        language === languageType.C
          ? "c"
          : language === languageType.CPP
            ? "cpp"
            : language === languageType.PYTHON
              ? "py"
              : language == languageType.JAVA
                ? "java"
                : "";
      const folderPath = path.resolve(__dirname, `../../temp/${folderName}`);
      const filePath = path.resolve(folderPath, `${fileName}.${languagetype}`);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      fs.writeFileSync(filePath, sourceCode);
      return { result: "", filePath, file: `${fileName}.${languagetype}` };
    } catch (error) {
      return { result: "Error to create file", filePath: "", file: "" };
    }
  },
  moveFileToIsolate: async (
    filePath: string,
    boxId: number,
  ): Promise<IMoveFile> => {
    try {
      const sanboxPath = execSync(`isolate --init --box-id=${boxId}`);
      execSync(`mv ${filePath} ${sanboxPath.toString().trim()}/box/`);
      return { result: "", sanboxPath: `${sanboxPath.toString().trim()}/box` };
    } catch (error) {
      return { result: "Error Move File To isolate", sanboxPath: "" };
    }
  },
  compileFile: async (
    sanboxPath: string,
    language: languageType,
    file: string,
  ): Promise<ICompileFile> => {
    try {
      const regex = /\w+/;
      const filenameMatch = file.match(regex);
      if (!filenameMatch) {
        throw new Error("INVALID_FILEPATH");
      }
      const fullPath = path.join(sanboxPath, file);
      if (language === languageType.C) {
        execSync(
          `gcc -w -std=c++14 ${fullPath} -o ${sanboxPath}/${filenameMatch}`,
        );
      } else if (language === languageType.CPP) {
        execSync(
          `g++ -w -std=c++14 ${fullPath} -o ${sanboxPath}/${filenameMatch}`,
        );
      } else if (language === languageType.JAVA) {
        execSync(`javac -d ${sanboxPath}/${filenameMatch}.class ${fullPath}`);
      }
      return { result: "" };
    } catch (error: any) {
      const err = error.stdout.toString()
        ? error.stdout.toString()
        : error.stderr.toString();
      return { result: err };
    }
  },
  Run: async (
    boxId: number,
    language: languageType,
    sanboxPath: string,
    input: string,
    file: string,
  ): Promise<ExecutionResult> => {
    return new Promise(async (resolve, _reject) => {
      try {
        execSync(`echo ${input} > ${sanboxPath.toString().trim()}/input.txt`);
        const filenameMatch = file.match(/\w+/);
        let stdout: string = "";
        if (language === languageType.C || language === languageType.CPP) {
          stdout = execSync(
            `isolate --box-id=${boxId} --silent --stderr-to-stdout --stdin=input.txt --run ${filenameMatch}`,
            { encoding: "utf-8" },
          );
        } else if (language === languageType.JAVA) {
          stdout = execSync(
            `isolate --box-id=${boxId} --silent --stderr-to-stdout --stdin=input.txt --run /usr/lib/jvm/java-17-openjdk-amd64/bin/java ${filenameMatch}`,
            { encoding: "utf-8" },
          );
        } else if (language === languageType.PYTHON) {
          stdout = execSync(
            `isolate --box-id=${boxId} --silent --stderr-to-stdout --stdin=input.txt --run /usr/bin/python3 ${file}`,
            { encoding: "utf-8" },
          );
        }
        resolve({ result: stdout.toString() });
      } catch (error: any) {
        const err = error.stdout.toString()
          ? error.stdout.toString()
          : error.stderr.toString();
        resolve({ result: err });
      }
    });
  },

  removeIsolateByBoxId: async (boxId: number) => {
    try {
      execSync(`isolate --box-id=${boxId} --cleanup`);
    } catch (error) {
      console.log(error);
    }
  },

  generateReusltProblem: async (
    expectedOutputs: string[],
    executionResults: ExecutionResult[],
  ) => {
    let result: IResultProblem[] = [];
    let status: boolean = true;
    executionResults.forEach((executionResult, index) => {
      const expectedOutput = expectedOutputs[index];
      const isPass = testCaseUtils.checkOutputEquality(
        expectedOutput,
        executionResult.result,
      );
      if (!isPass) {
        status = false;
      }
      result.push({
        output: executionResult.result,
        isPass: isPass,
      });
    });
    return { result, status };
  },
};
