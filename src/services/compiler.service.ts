import fs from "fs";
import path from "path"
import { execSync, execFile } from "child_process"
import {
  ExecutionResult,
  ICompileFile,
  ICreateFile,
} from "../interfaces/compiler.interface"

export const compilerService = {
  createFile: async (
    sourceCode: string,
    fileName: string
  ): Promise<ICreateFile> => {
    try {
      const folderPath = path.resolve(__dirname, "../../temp/cpp");
      const filePath = path.resolve(folderPath, `${fileName}.cpp`)

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
      }

      fs.writeFileSync(filePath, sourceCode);
      return { result: "", filePath }
    } catch (error) {
      console.log(error)
      return { result: "Error to create file", filePath: "" };
    }
  },

  compileFile: async (filePath: string): Promise<ICompileFile> => {
    try {
      const regex = /([^\\/:*?"<>|\r\n"]+).\w+$/;
      const filenameMatch = filePath.match(regex);
      const filename = filenameMatch ? filenameMatch[1] : null;

      if (!filename) {
        throw new Error("INVALID_FILEPATH");
      }

      const exeFolerPath = "./temp/exe";
      if (!fs.existsSync(exeFolerPath)) {
        fs.mkdirSync(exeFolerPath, { recursive: true });
      }
      const executablePath = path.join(exeFolerPath, filename);
      execSync(`g++ -w -std=c++14 ${filePath} -o ${executablePath}`);
      // console.log(executablePath)
      return { result: "", executablePath: executablePath };
    } catch (error) {
      return { result: "Error to compile File", executablePath: "" }
    }
  },
  Run: async (
    executeablePath: string,
    input: string
  ): Promise<ExecutionResult> => {
    return new Promise(async (resolve, reject) => {
      try {
        const options = {
          timeout: 1000,
          maxBuffer: 1024 * 1024,
        }

        const child = await execFile(
          executeablePath,
          options,
          (error, stdout, stderr) => {
            // console.log("run executable.")
              if (error) {
                resolve({
                  result: "Error",
                });
              } else {
                resolve({
                  result: stdout,
                });
              }
          }
        );
        if (input !== "") {
          child.stdin?.pipe(child.stdin);
          child.stdin?.setDefaultEncoding("utf8");
          child.stdin?.write(input);
          child.stdin?.end();
          child.stdin?.on("error", (error: Error) => {
            if (error.message !== "write") {
              resolve({ result: "ERROR" })
            }
          })
        }
      } catch (error) {
        console.log(error)
      }
    })
  }
};

