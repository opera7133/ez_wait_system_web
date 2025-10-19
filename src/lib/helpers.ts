import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import axios from "axios";
import { Queue } from "./queue";

export const fetchQueueNumbers = (
  called: boolean,
  callback: (numbers: Queue[]) => void
) => {
  const q = query(collection(db, "QUEUES"), where("called", "==", called));

  return onSnapshot(q, (snapshot) => {
    const numbers = snapshot.docs
      .map((doc) => ({
        queueId: doc.id,
        number: doc.data().number,
        called: doc.data().called,
        createdAt: doc.data().createdAt.toDate(),
        calledAt: doc.data().calledAt ? doc.data().calledAt.toDate() : null,
        lineNotifyId: doc.data().lineNotifyId || null,
      }))
      .sort((a, b) => b.number - a.number);
    callback(numbers);
  });
};

// LINEユーザーIDを登録
export const registerLineId = async (id: string, lineId: string) => {
  try {
    await updateDoc(doc(db, "QUEUES", id), { lineNotifyId: lineId });
  } catch (error) {
    console.error("LINE ID登録エラー:", error);
  }
};

// 呼び出しステータスに変更
export const callTicket = async (id: string, userId?: string | null) => {
  try {
    await updateDoc(doc(db, "QUEUES", id), {
      called: true,
      calledAt: new Date(),
    });
    if (userId) await axios.post("/api/sendline", { id, userId });
  } catch (error) {
    console.error("呼び出しエラー:", error);
  }
};

// 呼び出し取り消し（waitingに戻す）
export const cancelCallTicket = async (id: string) => {
  try {
    await updateDoc(doc(db, "QUEUES", id), { called: false });
  } catch (error) {
    console.error("呼び出し取り消しエラー:", error);
  }
};

// チケット削除
export const deleteTicket = async (id: string) => {
  try {
    await deleteDoc(doc(db, "QUEUES", id));
  } catch (error) {
    console.error("削除エラー:", error);
  }
};
