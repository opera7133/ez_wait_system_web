import { GetServerSidePropsContext } from "next";
import { getQueueData, getSingleQueue } from "./api/queue";
import { NextSeo } from "next-seo";
import Link from "next/link";

type Ticket = {
  id: string;
  ticketNumber: string;
  groupSize: number;
  lineNotifyId?: string;
};

export default function Home({
  calledNumbers,
  waitingNumbers,
  queue,
}: {
  calledNumbers: Ticket[];
  waitingNumbers: Ticket[];
  queue: Ticket;
}) {
  return (
    <div className="min-h-screen text-black bg-gray-100 p-4">
      <NextSeo
        title="EZ WAIT SYSTEM"
        description="シンプルな順番待ちシステム"
      />
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-6">
          現在の呼び出し状況
        </h1>
        {queue && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">現在の番号</h2>
            <div className="bg-blue-100 border border-blue-200 p-4 rounded-lg flex flex-col justify-between items-center">
              <span className="text-3xl font-medium">{queue.ticketNumber}</span>
              <span className="text-sm text-gray-600">
                人数: {queue.groupSize}人
              </span>
            </div>
          </div>
        )}
        <div className="mb-8">
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
                  <span className="text-sm text-gray-600">
                    人数: {number.groupSize}人
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              現在、呼び出し中の番号はありません。
            </p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">待機中の番号</h2>
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
                  <span className="text-sm text-gray-600">
                    人数: {number.groupSize}人
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">現在、待機中の番号はありません。</p>
          )}
        </div>
        {queue && (
          <>
            {queue.lineNotifyId ? (
              <div className="bg-lime-600 text-center mt-8 rounded duration-150 hover:bg-lime-700 text-white w-full block py-2">
                LINEと連携済みです
              </div>
            ) : (
              <div className="mt-8 text-center">
                <a
                  href={`https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_DOMAIN}/api/callback&state=${queue.id}&bot_prompt=normal&scope=profile%20openid&nonce=foobar&prompt=consent`}
                  className="bg-lime-600 rounded duration-150 hover:bg-lime-700 text-white w-full block py-2"
                >
                  LINEと連携する
                </a>
              </div>
            )}
          </>
        )}
        <div className="mt-8 text-center">
          <Link href="/dash" className="text-blue-500 hover:underline">
            管理画面へ
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { waitingList, calledList } = await getQueueData();
  const { query } = ctx;
  const docId = query.id;
  const queue = await getSingleQueue(docId as string);
  return {
    props: {
      waitingNumbers: waitingList,
      calledNumbers: calledList,
      queue: queue || null,
    },
  };
}
