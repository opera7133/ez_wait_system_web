// pages/admin/dashboard.js
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchQueueNumbers } from "@/lib/helpers";
import { callTicket, cancelCallTicket, deleteTicket } from "@/lib/helpers";
import { NextSeo } from "next-seo";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

type QueueNumber = {
  id: string;
  ticketNumber: number;
  groupSize: number;
  lineNotifyId?: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [waitingNumbers, setWaitingNumbers] = useState<QueueNumber[]>([]);
  const [calledNumbers, setCalledNumbers] = useState<QueueNumber[]>([]);

  useEffect(() => {
    if (!user) return;

    // 呼び出し前と呼び出し中の番号をリアルタイム取得
    const unsubscribeWaiting = fetchQueueNumbers("waiting", setWaitingNumbers);
    const unsubscribeCalled = fetchQueueNumbers("called", setCalledNumbers);

    return () => {
      unsubscribeWaiting();
      unsubscribeCalled();
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen text-black bg-gray-100 p-4">
      <NextSeo title="管理画面 - EZ WAIT SYSTEM" />
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-6">管理画面</h1>
        <div className="w-full flex items-center justify-end mb-4">
          <button
            className="bg-red-500 duration-150 text-white px-3 py-1 rounded hover:bg-red-600"
            onClick={() => signOut(auth)}
          >
            ログアウト
          </button>
        </div>

        {/* 呼び出し前の番号一覧 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">呼び出し前の番号</h2>
          {waitingNumbers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {waitingNumbers.map((number) => (
                <div
                  key={number.id}
                  className="bg-orange-100 border border-orange-200 p-4 rounded-lg flex flex-col justify-between items-center"
                >
                  <span className="text-3xl font-medium">
                    {number.ticketNumber}
                  </span>
                  <span className="text-sm text-gray-600 mb-2">
                    人数: {number.groupSize}人
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => callTicket(number.id, number.lineNotifyId)}
                      className="bg-green-500 duration-150 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      呼び出し
                    </button>
                    <button
                      onClick={() => deleteTicket(number.id)}
                      className="bg-red-500 duration-150 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              現在、呼び出し前の番号はありません。
            </p>
          )}
        </div>

        {/* 呼び出し中の番号一覧 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">呼び出し中の番号</h2>
          {calledNumbers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {calledNumbers.map((number) => (
                <div
                  key={number.id}
                  className="bg-green-100 border border-green-200 p-4 rounded-lg flex flex-col justify-between items-center"
                >
                  <span className="text-3xl font-medium">
                    {number.ticketNumber}
                  </span>
                  <span className="text-sm text-gray-600 mb-2">
                    人数: {number.groupSize}人
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => cancelCallTicket(number.id)}
                      className="bg-yellow-500 duration-150 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      取り消し
                    </button>
                    <button
                      onClick={() => deleteTicket(number.id)}
                      className="bg-red-500 duration-150 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              現在、呼び出し中の番号はありません。
            </p>
          )}
        </div>
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-500 hover:underline">
            一般画面に戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
