import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  try {
    const tokenRes = await axios.get(
      `https://graph.facebook.com/v20.0/oauth/access_token`, {
        params: {
          client_id: process.env.FB_APP_ID,
          client_secret: process.env.FB_APP_SECRET,
          redirect_uri: "https://yourdomain.com/api/facebook/callback",
          code,
        }
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Get WhatsApp accounts linked
    const wabaRes = await axios.get(
      `https://graph.facebook.com/v20.0/me/accounts?access_token=${accessToken}`
    );

    console.log("User Accounts:", wabaRes.data);

    res.json({
      message: "WhatsApp connected successfully",
      accessToken,
      accounts: wabaRes.data,
    });

  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to connect WhatsApp" });
  }
}
