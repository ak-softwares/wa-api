import { z } from "zod";
import * as calendar from "./googleCalendar";
import { ActionConfig } from "@/types/Tool";

export const GOOGLE_CALENDAR: Record<string, ActionConfig> = {
  /* =========================
     CREATE EVENT
  ========================= */
  create_event: {
    title: "Create Event",
    description: "Create a new calendar event",
    schema: z.object({
      summary: z.string(),
      description: z.string().optional(),
      start: z.string(), // ISO datetime
      end: z.string(),   // ISO datetime
      timeZone: z.string().default("Asia/Kolkata"),
    }),
    execute: calendar.create_event,
  },

  /* =========================
     LIST EVENTS
  ========================= */
  list_events: {
    title: "List Events",
    description: "Fetch upcoming events",
    schema: z.object({
      limit: z.number().optional(),
      from: z.string().optional(), // ISO datetime
    }),
    execute: calendar.list_events,
  },

  /* =========================
     UPDATE EVENT
  ========================= */
  update_event: {
    title: "Update Event",
    description: "Update an existing event",
    schema: z.object({
      eventId: z.string(),
      summary: z.string().optional(),
      description: z.string().optional(),
      start: z.string().optional(),
      end: z.string().optional(),
    }),
    execute: calendar.update_event,
  },

  /* =========================
     DELETE EVENT
  ========================= */
  delete_event: {
    title: "Delete Event",
    description: "Delete a calendar event",
    schema: z.object({
      eventId: z.string(),
    }),
    execute: calendar.delete_event,
  },

  /* =========================
     FREE BUSY CHECK
  ========================= */
  check_availability: {
    title: "Check Availability",
    description: "Check free/busy slots",
    schema: z.object({
      start: z.string(),
      end: z.string(),
    }),
    execute: calendar.check_availability,
  },
};
