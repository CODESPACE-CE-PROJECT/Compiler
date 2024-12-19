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
import { checkRedisHealth, publicTopic, redisClient } from "./redis.service";
import logger from '../utils/logger.util'

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
      logger.info("Redis Connected")
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
              stateSubmission: resultProblem.status ? "PASS" : "FAILED",
            },
            submission.token,
          );

          redisClient.set(`submission-${resultSubmit.data.username}`, JSON.stringify({ submissionId: resultSubmit.data.submissionId }), { EX: 240 })

          redisClient.set(`submissionState-${submission.username}`, "false", { EX: 240 })

          publicTopic('submission', JSON.stringify({ submissionId: resultSubmit.data.submissionId, username: resultSubmit.data.username }))

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

        await redisClient.set(`compiler-${data.username}`, JSON.stringify(outputResult), { EX: 240 })
        const updateOutputResult = { ...outputResult, username: data.username }
        publicTopic('compiler', JSON.stringify(updateOutputResult))

        channel.ack(msg);
      } catch (error) {
        console.log(error)
        throw new Error("Error receiveData");
      }
    });
  },
};
