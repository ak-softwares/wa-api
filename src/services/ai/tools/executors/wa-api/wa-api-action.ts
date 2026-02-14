import { z } from "zod";
import * as waApi from "./wa-api";
import { ActionConfig } from "@/types/Tool";

export const WA_API: Record<string, ActionConfig> = {
  send_location: {
    title: "Send Location",
    description: "Send a location message to a phone number",
    schema: z.object({
      number: z.string().describe("Recipient phone with country code"),
      latitude: z.number(),
      longitude: z.number(),
      name: z.string().optional(),
      address: z.string().optional(),
    }),
    execute: waApi.send_location,
  },
};
