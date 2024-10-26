import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import axios from "axios";

export const fetchQueueNumbers = (
  status: string,
  callback: (
    numbers: { id: string; ticketNumber: number; groupSize: number }[]
  ) => void
) => {
  const q = query(collection(db, "QUEUE"), where("status", "==", status));

  return onSnapshot(q, (snapshot) => {
    const numbers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ticketNumber: doc.data().ticketNumber,
      groupSize: doc.data().groupSize,
      lineNotifyId: doc.data().lineNotifyId || null,
    }));
    callback(numbers);
  });
};

// LINEユーザーIDを登録
export const registerLineId = async (id: string, lineId: string) => {
  try {
    await updateDoc(doc(db, "QUEUE", id), { lineNotifyId: lineId });
  } catch (error) {
    console.error("LINE ID登録エラー:", error);
  }
};

// 呼び出しステータスに変更
export const callTicket = async (id: string, userId?: string) => {
  try {
    await updateDoc(doc(db, "QUEUE", id), {
      status: "called",
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
    await updateDoc(doc(db, "QUEUE", id), { status: "waiting" });
  } catch (error) {
    console.error("呼び出し取り消しエラー:", error);
  }
};

// チケット削除
export const deleteTicket = async (id: string) => {
  try {
    await deleteDoc(doc(db, "QUEUE", id));
  } catch (error) {
    console.error("削除エラー:", error);
  }
};
