import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import { environment } from "../config/environment";
import { ISubmission } from "../interfaces/submission.interface";
import {
  ICompileRequest,
  languageType,
} from "../interfaces/compiler.interface";
import strip from "strip-comments";
import logger from "../utils/logger.util";
import { resultService } from "./result.service";
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
    const channel: Channel = await connection.createChannel();
    await channel.assertQueue("compiler", { durable: true });
    await channel.assertQueue("submission", { durable: true });
    channel.consume("submission", (msg: ConsumeMessage | null) => {
      try {
        if (!msg) {
          throw new Error("Invalid Incoming Message");
        }
        const data: ISubmission = JSON.parse(msg?.content.toString() as string);
        const updateSourceCode = strip(data.sourceCode);
        logger.info(updateSourceCode);
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
        const updateFilename =
          data.language === languageType.JAVA
            ? data.fileName
            : `${process.pid}`;
        const outputResult = await resultService.outputResult(
          updateSourceCode,
          data.language,
          data.input,
          updateFilename,
        );
        console.log(outputResult);
        channel.ack(msg);
      } catch (error) {
        throw new Error("Error receiveData");
      }
    });
  },
};
