import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import { environment } from "../config/environment";
import { IResultSubmission, ISubmissionRequest } from "../interfaces/submission.interface";
import {
  ICompileRequest,
  languageType,
} from "../interfaces/compiler.interface";
import strip from "strip-comments";
import { resultService } from "./result.service";
import { problemService } from "./problem.service";
import { ITestCase } from "../interfaces/testcase.interface";
import { submissionService } from "./submission.service";
import { checkRedisHealth, redisClient } from "./redis.service";
export const rabbitMQService = {
  sendDataToQueue: async (queueName: string, data: any) => {
    const connection: Connection = await client.connect(
      `amqp://${environment.RMQUSER}:${environment.RMQPASS}@${environment.RMQHOST}:5672`,
    );
    const channel: Channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });

    setTimeout(() => {
      connection.close();
    }, 500);
  },
  receiveData: async () => {
    const connection: Connection = await client.connect(
      `amqp://${environment.RMQUSER}:${environment.RMQPASS}@${environment.RMQHOST}:5672`,
    );
    await redisClient.connect()
    if (await checkRedisHealth()) {
      console.log("Redis Connected")
    }
    const channel: Channel = await connection.createChannel();
    await channel.assertQueue("compiler", { durable: true });
    await channel.assertQueue("submission", { durable: true });
    channel.consume("submission", async (msg: ConsumeMessage | null) => {
      try {
        if (!msg) {
          throw new Error("Invalid Incoming Message");
        }
        const submission: ISubmissionRequest = JSON.parse(
          msg?.content.toString() as string,
        );
        const updateSourceCode = strip(submission.sourceCode);
        const updateFileName =
          submission.language === languageType.JAVA
            ? submission.fileName
            : `${process.pid}`;
        const testcases: ITestCase = await problemService.getTestCases(
          submission.problemId,
          submission.token,
        );
        submission.sourceCode = updateSourceCode;
        submission.fileName = updateFileName;
        const resultProblem = await resultService.outputResultWithTestCase(
          submission,
          testcases,
        );
        if ("status" in resultProblem) {
          const resultSubmit: IResultSubmission = await submissionService.submit(
            {
              problemId: submission.problemId,
              sourceCode: submission.sourceCode,
              results: resultProblem.result,
              status: resultProblem.status,
            },
            submission.token,
          );
          redisClient.set(`submission-${resultSubmit.username}`, JSON.stringify({ submissionId: resultSubmit.submissionId }), { EX: 240 })
          console.log(resultSubmit);
        } else {
          throw new Error("Error To Submission File: " + resultProblem.result);
        }
        channel.ack(msg);
      } catch (error) {
        throw new Error("Error receiveData");
      }
    });
    channel.consume("compiler", async (msg: ConsumeMessage | null) => {
      try {
        if (!msg) {
          throw new Error("Invalid Incoming Message");
        }
        const data: ICompileRequest = JSON.parse(
          msg?.content.toString() as string,
        );
        const updateSourceCode = strip(data.sourceCode);
        const updateFileName =
          data.language === languageType.JAVA
            ? data.fileName
            : `${process.pid}`;
        const outputResult = await resultService.outputResult(
          updateSourceCode,
          data.language,
          data.input,
          updateFileName,
        );
        console.log(outputResult);
        await redisClient.set(`compiler-${data.username}`, JSON.stringify(outputResult), { EX: 240 })
        channel.ack(msg);
      } catch (error) {
        throw new Error("Error receiveData");
      }
    });
  },
};
