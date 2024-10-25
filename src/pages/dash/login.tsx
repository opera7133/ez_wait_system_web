// pages/admin/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { NextSeo } from "next-seo";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dash"); // 認証成功時に管理画面にリダイレクト
    } catch (e) {
      setError(
        "ログインに失敗しました。メールアドレスまたはパスワードを確認してください。"
      );
    }
  };

  return (
    <div className="min-h-screen text-black flex items-center justify-center bg-gray-100">
      <NextSeo title="ログイン - EZ WAIT SYSTEM" />
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white p-8 shadow-md rounded-lg"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          管理者ログイン
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">メールアドレス</label>
          <input
            type="email"
            className="mt-1 p-2 w-full border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">パスワード</label>
          <input
            type="password"
            className="mt-1 p-2 w-full border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          ログイン
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
