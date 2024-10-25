import { NextApiRequest, NextApiResponse } from "next";
import * as line from "@line/bot-sdk";
import { getSingleQueue } from "./queue";

const config = {
  channelAccessToken: process.env.LINE_MESSAGING_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_MESSAGING_SECRET || "",
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id, userId } = req.body;
    const queue = await getSingleQueue(id);
    if (!queue) {
      res.status(404).json({ message: "Queue not found" });
      return;
    }
    await client.pushMessage({
      to: userId,
      messages: [
        {
          type: "text",
          text: `あなたの番号 ${queue?.ticketNumber} が呼び出されました。`,
        },
      ],
    });

    res.status(200).json({
      message: `Sent Message: あなたの番号${queue?.ticketNumber}が呼び出されました。`,
    });
  } catch (e) {
    res.status(500).json({ message: `Error: ${e} ` });
  }
}
