import fs, { readFileSync, writeFileSync } from "fs";
import path from "path";
import { execSync, spawn } from "child_process";
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
  compileFile: async (
    filePath: string,
    language: languageType,
    file: string,
  ): Promise<ICompileFile> => {
    try {
      const regex = /\w+/;
      const filenameMatch = file.match(regex);
      let execFolder = "";
      let exeFile = "";
      if (!filenameMatch) {
        throw new Error("INVALID_FILEPATH");
      }
      const folderPath = path.resolve(__dirname, `../../temp`);
      if (language === languageType.C) {
        execFolder = path.resolve(folderPath, "exe-c");
        exeFile = `${execFolder}/${filenameMatch}`;
        if (!fs.existsSync(execFolder)) {
          fs.mkdirSync(execFolder, { recursive: true });
        }
        execSync(`gcc -w -std=c++14 ${filePath} -o ${exeFile}`);
      } else if (language === languageType.CPP) {
        execFolder = path.resolve(folderPath, "exe-cpp");
        exeFile = `${execFolder}/${filenameMatch}`;
        if (!fs.existsSync(execFolder)) {
          fs.mkdirSync(execFolder, { recursive: true });
        }
        execSync(`g++ -w -std=c++14 ${filePath} -o ${exeFile}`);
      } else if (language === languageType.JAVA) {
        execFolder = path.resolve(folderPath, "exe-java");
        exeFile = `${execFolder}/${filenameMatch}.class`;
        if (!fs.existsSync(execFolder)) {
          fs.mkdirSync(execFolder, { recursive: true });
        }
        execSync(`javac -d ${execFolder} ${filePath}`);
      } else if (language === languageType.PYTHON) {
        exeFile = `${filePath}`;
      }
      return { result: "", exeFile: exeFile };
    } catch (error: any) {
      const err = error.stdout.toString()
        ? error.stdout.toString()
        : error.stderr.toString();
      console.log(err);
      return { result: err, exeFile: "" };
    }
  },

  moveFileToIsolate: async (
    exefilePath: string,
    boxId: number,
  ): Promise<IMoveFile> => {
    try {
      const sanboxPath = execSync(`isolate --init --box-id=${boxId}`);
      execSync(`cp ${exefilePath} ${sanboxPath.toString().trim()}/box/`);
      return { result: "", sanboxPath: `${sanboxPath.toString().trim()}/box` };
    } catch (error) {
      return { result: "Error Move File To isolate", sanboxPath: "" };
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
      const inputFile = `${sanboxPath.toString().trim()}/input.txt`;
      const outputFile = `${sanboxPath.toString().trim()}/output.txt`;
      const metaFile = `${sanboxPath.toString().trim()}/meta.txt`;
      writeFileSync(inputFile, input);
      writeFileSync(outputFile, "");
      writeFileSync(metaFile, "");
      try {
        const filenameMatch = file.match(/\w+/);
        let command = "";
        if (language === languageType.C || language === languageType.CPP) {
          command = `isolate --box-id=${boxId} --time=5 --wall-time=5 --stderr-to-stdout --stdin=input.txt --stdout=output.txt --meta=${metaFile} --silent --run ${filenameMatch}`;
        } else if (language === languageType.JAVA) {
          command = `isolate -p --box-id=${boxId} --time=5 --wall-time=5 --stderr-to-stdout --stdin=input.txt --stdout=output.txt --meta=${metaFile} --silent --run /usr/lib/jvm/java-17-openjdk-amd64/bin/java ${filenameMatch}`;
        } else if (language === languageType.PYTHON) {
          command = `isolate --box-id=${boxId} --time=5 --wall-time=5 --stderr-to-stdout --stdin=input.txt --stdout=output.txt --meta=${metaFile} --silent --run /usr/bin/python3 ${file}`;
        }
        const childProcess = spawn(command, { shell: true });

        // Handle process exit
        childProcess.on("exit", () => {
          const metaContent = readFileSync(metaFile, "utf-8");
          const output = readFileSync(outputFile, "utf-8");

          const lines = metaContent.split("\n");
          const status =
            lines
              .find((line) => line.startsWith("status:"))
              ?.split(":")[1]
              ?.trim() || "";
          const exitCode =
            lines
              .find((line) => line.startsWith("exitCode:"))
              ?.split(":")[1]
              ?.trim() || "";

          if (status === "TO") {
            resolve({ result: "Execution Time Out" });
          } else if (exitCode !== "0") {
            resolve({ result: output });
          } else {
            resolve({ result: output });
          }
        });
      } catch (error) {
        resolve({ result: "error execute" });
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
