import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NextApiRequest, NextApiResponse } from "next";

export async function getQueueData() {
  const queueRef = collection(db, "QUEUE");

  // Firestoreから「待機中」と「呼び出し済み」のデータを取得
  const waitingQuery = query(queueRef, where("status", "==", "waiting"));
  const calledQuery = query(queueRef, where("status", "==", "called"));

  const waitingSnapshot = await getDocs(waitingQuery);
  const calledSnapshot = await getDocs(calledQuery);

  const waitingList = waitingSnapshot.docs
    .map((doc) => ({
      ticketNumber: doc.data().ticketNumber,
      groupSize: doc.data().groupSize,
      createdAt: doc.data().createdAt.toDate().toJSON(),
    }))
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

  const calledList = calledSnapshot.docs
    .map((doc) => ({
      ticketNumber: doc.data().ticketNumber,
      groupSize: doc.data().groupSize,
      calledAt: doc.data().calledAt?.toDate().toJSON() || null,
      createdAt: doc.data().createdAt.toDate().toJSON(),
    }))
    .sort((a, b) => Date.parse(b.calledAt) - Date.parse(a.calledAt));
  return { waitingList, calledList };
}

export async function getSingleQueue(id: string) {
  const queueRef = collection(db, "QUEUE");
  const querySnapshot = await getDocs(queueRef);
  const queue = querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ticketNumber: doc.data().ticketNumber,
      groupSize: doc.data().groupSize,
      status: doc.data().status,
      createdAt: doc.data().createdAt.toDate().toJSON(),
      calledAt: doc.data().calledAt?.toDate().toJSON() || null,
      lineNotifyId: doc.data().lineNotifyId || null,
    }))
    .find((doc) => doc.id === id);
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
