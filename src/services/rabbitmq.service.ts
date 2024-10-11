import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import { environment } from "../config/environment";

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
  receiveData: async (queueName: string) => {
    const connection: Connection = await client.connect(
      `amqp://${environment.RMQUSER}:${environment.RMQPASS}@${environment.RMQHOST}:5672`,
    );
    const channel: Channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    channel.consume(queueName, (msg: ConsumeMessage | null) => {
      try {
        if (!msg) {
          throw new Error("Invalid Incoming Message");
        }
        const data = JSON.parse(msg?.content.toString() as string);
        channel.ack(msg);
        return data;
      } catch (error) {
        throw new Error("Error receiveData");
      }
    });
  },
};
