import { z } from "zod";
import * as instagram from "./instagram";
import { ActionConfig } from "@/types/Tool";

export const INSTAGRAM: Record<string, ActionConfig> = {
  publish_photo: {
    title: "Publish Instagram Photo",
    description: "Create and publish an Instagram photo post from a public image URL.",
    schema: z.object({
      image_url: z.string().url().describe("Publicly accessible image URL to publish"),
      caption: z.string().optional().describe("Caption for the Instagram post"),
    }),
    execute: instagram.publish_photo,
  },
};
