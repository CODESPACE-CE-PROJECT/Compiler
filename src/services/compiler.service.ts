import fs from "fs";
import path from "path";
import { execSync, execFile, spawnSync } from "child_process";
import {
  ExecutionResult,
  ICompileFile,
  ICreateFile,
  IMoveFile,
  languageType,
} from "../interfaces/compiler.interface";
import log from "../utils/logger";
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
    boxID: number,
  ): Promise<IMoveFile> => {
    try {
      const sanboxPath = execSync(`isolate --init --box-id=${boxID}`, {
        encoding: "utf-8",
      });
      execSync(`mv ${filePath} ${sanboxPath.trim()}/box/`);
      return { result: "", sanboxPath: `${sanboxPath.trim()}/box` };
    } catch (error) {
      return { result: "Error Move File To isolate", sanboxPath: "" };
    }
  },
  compileFile: async (
    sanboxPath: string,
    language: string,
    file: string,
  ): Promise<ICompileFile> => {
    try {
      const regex = /\w+/;
      const filenameMatch = file.match(regex);
      log.info(`filename: ${filenameMatch}`);
      if (!filenameMatch) {
        throw new Error("INVALID_FILEPATH");
      }
      const fullPath = path.join(sanboxPath, file);
      if (language === languageType.C) {
        execSync(
          `gcc -w -std=c++14 ${fullPath} -o ${sanboxPath}/${filenameMatch}`,
          { encoding: "utf-8" },
        );
      } else if (language === languageType.CPP) {
        execSync(
          `g++ -w -std=c++14 ${fullPath} -o ${sanboxPath}/${filenameMatch}`,
          { encoding: "utf-8" },
        );
      } else if (language === languageType.JAVA) {
        console.log(fullPath);
        execSync(`javac -d ${sanboxPath}/${filenameMatch} ${fullPath}`);
      }
      return { result: "" };
    } catch (error) {
      return { result: "Error to compile File" };
    }
  },
  Run: async (
    executeablePath: string,
    language: string,
    input: string,
    filename: string,
  ): Promise<ExecutionResult> => {
    return new Promise(async (resolve, reject) => {
      try {
      } catch (error) {
        console.log(error);
      }
    });
  },
};
