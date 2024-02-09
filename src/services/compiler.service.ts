import fs from "fs";
import path from "path"
import { execSync, execFile,spawnSync } from "child_process"
import {
  ExecutionResult,
  ICompileFile,
  ICreateFile,
} from "../interfaces/compiler.interface"

export const compilerService = {
  createFile: async (
    sourceCode: string,
    fileName: string,
    language: string,
  ): Promise<ICreateFile> => {
    try {
      
      if(language === "c"){
        const folderPath = path.resolve(__dirname,"../../temp/c")
        const filePath = path.resolve(folderPath, `${fileName}.c`)
        if (!fs.existsSync(folderPath)) {
         fs.mkdirSync(folderPath, { recursive: true })
        }

        fs.writeFileSync(filePath, sourceCode);
        return { result: "", filePath }
      } else if(language === "cpp") {
        const folderPath = path.resolve(__dirname,"../../temp/cpp")
        const filePath = path.resolve(folderPath, `${fileName}.cpp`)
        if (!fs.existsSync(folderPath)) {
         fs.mkdirSync(folderPath, { recursive: true })
        }

        fs.writeFileSync(filePath, sourceCode);
        return { result: "", filePath }
      } else if(language === "python"){
        const folderPath = path.resolve(__dirname, "../../temp/python")
        const filePath = path.resolve(folderPath, `${fileName}.py`)
        if (!fs.existsSync(folderPath)) {
         fs.mkdirSync(folderPath, { recursive: true })
        }

        fs.writeFileSync(filePath, sourceCode);
        return { result: "", filePath }
      } else if(language === "javascript"){
        const folderPath = path.resolve(__dirname, "../../temp/javascript")
        const filePath = path.resolve(folderPath, `${fileName}.js`)
        if (!fs.existsSync(folderPath)) {
         fs.mkdirSync(folderPath, { recursive: true })
        }

        fs.writeFileSync(filePath, sourceCode);
        return { result: "", filePath }
      }
      return {result: "Error CreateFile", filePath:""} 
    } catch (error) {
      console.log(error)
      return { result: "Error to create file", filePath: "" };
    }
  },

  compileFile: async (filePath: string, language: string): Promise<ICompileFile> => {
    try {
      const regex = /([^\\/:*?"<>|\r\n"]+).\w+$/;
      const filenameMatch = filePath.match(regex);
      const filename = filenameMatch ? filenameMatch[1] : null;

      if (!filename) {
        throw new Error("INVALID_FILEPATH");
      } 
      var executablePath:string = "";
      if (language === "cpp"){
        const exeFolerPath = "./temp/exe-cpp";
        if (!fs.existsSync(exeFolerPath)) {
          fs.mkdirSync(exeFolerPath, { recursive: true });
        }
        executablePath = path.join(exeFolerPath, filename);
        execSync(`g++ -w -std=c++14 ${filePath} -o ${executablePath}`);
      }else if (language === "c"){
        const exeFolerPath = "./temp/exe-c";
        if (!fs.existsSync(exeFolerPath)) {
          fs.mkdirSync(exeFolerPath, { recursive: true });
        }
        executablePath = path.join(exeFolerPath, filename);
        execSync(`gcc -w -std=c++14 ${filePath} -o ${executablePath}`);
      }
       return { result: "", executablePath: executablePath }; 
   } catch (error) {
      return { result: "Error to compile File", executablePath: "" }
    }
  },
  Run: async (
    executeablePath: string,
    language: string,
    input: string
  ): Promise<ExecutionResult> => {
    return new Promise(async (resolve, reject) => {
      try {
        const options = {
          timeout: 1000,
          maxBuffer: 1024 * 1024,
        }
        if(language === "c" || language === "cpp"){
          const child = await execFile(
            executeablePath,
            options,
            (error, stdout, stderr) => {
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
        }else{
          if(language == "javascript") language = "node"
          const child = spawnSync(language,[executeablePath], {stdio:'pipe', input: input});
          if(child.error){
            resolve({
              result: "Error"
            })
          }else{
            resolve({
              result: child.output.toString()
            })
          }
        }
      } catch (error) {
        console.log(error)
      }
    })
  }
};

