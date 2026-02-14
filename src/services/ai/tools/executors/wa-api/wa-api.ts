import { ITool } from "@/models/Tool";

export const send_location = async (
  args: { number: string; latitude: number; longitude: number; name?: string; address?: string; },
  tool: ITool
) => {
  const { number, latitude, longitude, name, address } = args;
  const res = await fetch(tool.credentials.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tool.credentials.apiToken}`,
    },
    body: JSON.stringify({
      participants: [{ number }],
      messageType: "location",
      location: {
        latitude,
        longitude,
        name,
        address,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`WhatsApp API failed: ${await res.text()}`);
  }

  return res.json();
};
