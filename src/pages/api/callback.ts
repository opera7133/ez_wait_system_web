import { registerLineId } from "@/lib/helpers";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, state } = req.query;
  const tokenParams = new URLSearchParams();
  tokenParams.append("grant_type", "authorization_code");
  tokenParams.append("code", code as string);
  tokenParams.append(
    "redirect_uri",
    (process.env.NEXT_PUBLIC_DOMAIN + "/api/callback") as string
  );
  tokenParams.append(
    "client_id",
    process.env.NEXT_PUBLIC_LINE_CLIENT_ID as string
  );
  tokenParams.append("client_secret", process.env.LINE_CLIENT_SECRET as string);
  const token = await axios.post(
    "https://api.line.me/oauth2/v2.1/token",
    tokenParams,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  const { access_token } = token.data;
  const verify = await axios.get(
    "https://api.line.me/oauth2/v2.1/verify?access_token=" + access_token
  );
  if (verify.status !== 200) {
    res.status(500).json({ message: "LINE認証エラー" });
  }
  const userinfo = await axios.get("https://api.line.me/oauth2/v2.1/userinfo", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const { sub } = userinfo.data;
  await registerLineId(state as string, sub);
  res.redirect("/?id=" + state);
}
