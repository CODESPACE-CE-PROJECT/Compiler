import Docker from 'dockerode'
import { environment } from "../config/environment";
import tar from 'tar-stream'

const docker = new Docker({host: environment.DOCKER_HOST, port:2375})

export const terminalService = {
    CreateFileInContainer: async(container_id: string, sourceCode: string ,fileName: string, language: string) => {
        try {
           const container = docker.getContainer(container_id);
           const sourceCodeToBuffer = Buffer.from(sourceCode, 'utf-8')
           const pack = tar.pack()
           let lastFileName = ""
           if(language === "python"){
                lastFileName = "py"
           }else{
                lastFileName = language
           }
           pack.entry({name: `src/${language}/${fileName}.${lastFileName}`}, sourceCodeToBuffer)
           pack.finalize();
           container.putArchive(
            pack,
            { path: '/'},
            (err) => {
                if(err){
                    return "ErrorCreateFile"
                }
            }
           )
           return ""
        } catch (error) {
            return "ErrorCreateFile"
        }
    },
    RunCode: async (container_id: string, fileName: string, language: string ) => {
        try {
            const container = docker.getContainer(container_id)
            if (language === "cpp") {
                container.attach({
                    stream: true,
                    stdout: true,
                    stderr: true,
                    stdin: true
                }, (_err, stream) => {
                    stream?.write(`clear && g++ -w -std=c++14 /src/cpp/${fileName}.cpp -o /src/cpp/exe-cpp/${fileName} && /src/cpp/exe-cpp/./${fileName} \r`)
                })
            }else if (language === "c"){ 
                container.attach({
                    stream: true,
                    stdout: true,
                    stderr: true,
                    stdin: true
                }, (_err, stream) => {
                    stream?.write(`clear && gcc -w -std=c++14 /src/c/${fileName}.c -o /src/c/exe-c/${fileName} && /src/c/exe-c/./${fileName} \r`)
                })
            }else if (language === "python") { 
                container.attach({
                    stream: true,
                    stdout: true,
                    stderr: true,
                    stdin: true
                }, (_err, stream) => {
                    stream?.write(`clear && python /src/python/${fileName}.py \r`)
                })
            }else if (language === "java") { 
                container.attach({
                    stream: true,
                    stdout: true,
                    stderr: true,
                    stdin: true
                }, (_err, stream) => {
                    stream?.write(`clear && javac -d /src/java/exe-java/${fileName} /src/java/${fileName}.java && java -cp /src/java/exe-java/${fileName} ${fileName} \r`)
                })
            }
            return ""
        } catch (error) {
            return "Error to Run"
        }
    },
    compilerAndRun: async (container_id: string,sourceCode: string, language: string, fileName: string) => {
        try {
            if(language !== "java") fileName = `${process.pid}`
            const result:any = await terminalService.CreateFileInContainer(container_id, sourceCode, fileName,language);
            if(result !== ""){
                return result
            }
            const final = await terminalService.RunCode(container_id, fileName, language) 
            if (final){
                return final
            }      
        } catch (error) {
            return {result: "error"}
        }
    }
}