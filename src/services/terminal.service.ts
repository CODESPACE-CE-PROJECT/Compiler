import fs from "fs";
import path from "path";
import {execSync} from "child_process";
import { ICreateFile } from "../interfaces/compiler.interface";
import Docker from 'dockerode'
import { environment } from "../config/environment";

const docker = new Docker({host: environment.DOCKER_HOST, port:2375})

export const terminalService = {
    createFile: async (
        sourceCode: string,
        filename: string,
        language: string,
    ):Promise<ICreateFile> => {
       try {

            const folderPath = path.resolve(__dirname, `../../terminal/${language}`)

            if (!fs.existsSync(folderPath)){
                fs.mkdirSync(folderPath, {recursive: true})
            }

            if(language === "c"){
                const filePath = path.resolve(folderPath, `${filename}.c`)
                fs.writeFileSync(filePath, sourceCode);
                return { result: "", filePath}
            }else if (language === "cpp") {
                const filePath = path.resolve(folderPath, `${filename}.cpp`)
                fs.writeFileSync(filePath, sourceCode);
                return { result: "", filePath} 
            } else if (language === "python") {
                const filePath = path.resolve(folderPath, `${filename}.py`)
                fs.writeFileSync(filePath, sourceCode);
                return { result: "", filePath}                
            }else if (language === "java") {
                const filePath = path.resolve(folderPath, `${filename}.java`)
                fs.writeFileSync(filePath, sourceCode);
                return { result: "", filePath}                
            }

            return {result: "Error CreateFile", filePath: ""}

       } catch (error) {
            console.log(error)
            return {result: "Error CreateFile", filePath: ""}
       } 
    },
    moveFileToContainer: async (container_id: string, filePath: string, language: string) => {
        try {
            const regex = /([^\\/:*?"<>|\r\n"]+).\w+$/;
            const filenameMatch = filePath.match(regex);
            const filename = filenameMatch ? filenameMatch[0]:null;  

            if (!filename) {
                throw new Error("INVALID_FILEPATH");
            }
            
            const container = docker.getContainer(container_id)
            

            if (language === "cpp") {
                execSync(`docker cp ${filePath} ${container_id}:/src/cpp/${filename}`)
                container.attach({
                    stream: true,
                    stdout: true,
                    stderr: true,
                    stdin: true
                }, (_err, stream) => {
                    stream?.write(`clear && g++ -w -std=c++14 /src/cpp/${filename} -o /src/cpp/exe-cpp/${filename.split('.')[0]} && /src/cpp/exe-cpp/./${filename.split('.')[0]} \r`)
                })
            }else if (language === "c"){ 
                execSync(`docker cp ${filePath} ${container_id}:/src/c/${filename}`)
                container.attach({
                    stream: true,
                    stdout: true,
                    stderr: true,
                    stdin: true
                }, (_err, stream) => {
                    stream?.write(`clear && gcc -w -std=c++14 /src/c/${filename} -o /src/c/exe-c/${filename.split('.')[0]} && /src/c/exe-c/./${filename.split('.')[0]} \r`)
                })
            }else if (language === "python") { 
                execSync(`docker cp ${filePath} ${container_id}:/src/python/${filename}`)
                container.attach({
                    stream: true,
                    stdout: true,
                    stderr: true,
                    stdin: true
                }, (_err, stream) => {
                    stream?.write(`clear && python /src/python/${filename}\r`)
                })
            }else if (language === "java") { 
                execSync(`docker cp ${filePath} ${container_id}:/src/java/${filename}`)
                container.attach({
                    stream: true,
                    stdout: true,
                    stderr: true,
                    stdin: true
                }, (_err, stream) => {
                    stream?.write(`clear && javac -d /src/java/exe-java/${filename.split('.')[0]} /src/java/${filename} && java -cp /src/java/exe-java/${filename.split('.')[0]} ${filename.split('.')[0]}\r`)
                })
            }
            return { result: ""}
        } catch (error) {
            return { result: "Error to Copy to Container"} 
        }
    },
    compilerAndRun: async (container_id: string,sourceCode: string, language: string, fileName: string) => {
        try {
            if(language !== "java") fileName = `${process.pid}`
            const {result: createFileResult, filePath} = await terminalService.createFile(sourceCode, fileName, language);
            const {result} = await terminalService.moveFileToContainer(container_id, filePath, language)
           
            if (result){
                return result
            }      
        } catch (error) {
            return {result: "error"}
        }
    }
}