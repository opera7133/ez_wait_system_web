import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NextApiRequest, NextApiResponse } from "next";
import { Queue } from "@/lib/queue";

export async function getQueueData(): Promise<{
  waitingList: Queue[];
  calledList: Queue[];
}> {
  const queueRef = collection(db, "QUEUES");

  // Firestoreから「待機中」と「呼び出し済み」のデータを取得
  const waitingQuery = query(queueRef, where("called", "==", false));
  const calledQuery = query(queueRef, where("called", "==", true));

  const waitingSnapshot = await getDocs(waitingQuery);
  const calledSnapshot = await getDocs(calledQuery);

  const waitingList = waitingSnapshot.docs
    .map((doc) => ({
      queueId: doc.id,
      called: doc.data().called,
      number: doc.data().number,
      calledAt: doc.data().calledAt?.toDate().toJSON() || null,
      createdAt: doc.data().createdAt.toDate().toJSON(),
      lineNotifyId: doc.data().lineNotifyId || null,
    }))
    .sort((a, b) => b.number - a.number);

  const calledList = calledSnapshot.docs
    .map((doc) => ({
      queueId: doc.id,
      called: doc.data().called,
      number: doc.data().number,
      calledAt: doc.data().calledAt?.toDate().toJSON() || null,
      createdAt: doc.data().createdAt.toDate().toJSON(),
      lineNotifyId: doc.data().lineNotifyId || null,
    }))
    .sort((a, b) => b.number - a.number);
  return { waitingList, calledList };
}

export async function getSingleQueue(id: string): Promise<Queue | undefined> {
  const queueRef = collection(db, "QUEUES");
  const querySnapshot = await getDocs(queueRef);
  const queue = querySnapshot.docs
    .map((doc) => ({
      queueId: doc.data().queueId,
      number: doc.data().number,
      called: doc.data().called || false,
      createdAt: doc.data().createdAt.toDate().toJSON(),
      calledAt: doc.data().calledAt?.toDate().toJSON() || null,
      lineNotifyId: doc.data().lineNotifyId || null,
    }))
    .find((doc) => doc.queueId === id);
  return queue;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { waitingList, calledList } = await getQueueData();

    res.status(200).json({ waitingList, calledList });
  } catch (error) {
    console.error("Error fetching queue data:", error);
    res.status(500).json({ error: "Failed to fetch queue data" });
  }
}
