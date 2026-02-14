import { google } from "googleapis";
import { ITool } from "@/models/Tool";

function getCalendarClient(tool: ITool) {
  const creds = tool.credentials;

  const oauth2Client = new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: creds.access_token,
    refresh_token: creds.refresh_token,
    expiry_date: Number(creds.expiry_date),
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

/* ========================= */

export async function create_event(
  args: { summary: string; description?: string; start: string; end: string; timeZone: string; },
  tool: ITool
) {
  const calendar = getCalendarClient(tool);

  const res = await calendar.events.insert({
    calendarId: tool.credentials.calendarId || "primary",
    requestBody: {
      summary: args.summary,
      description: args.description,
      start: { dateTime: args.start, timeZone: args.timeZone },
      end: { dateTime: args.end, timeZone: args.timeZone },
    },
  });

  return res.data;
};

/* ========================= */

export async function list_events(
  args: { from?: string; limit?: number },
  tool: ITool
) {
  const calendar = getCalendarClient(tool);

  const res = await calendar.events.list({
    calendarId: tool.credentials.calendarId || "primary",
    maxResults: args.limit ?? 10,
    timeMin: args.from ?? new Date().toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return res.data.items;
};

/* ========================= */

export async function update_event(
  args: { eventId: string; summary?: string; description?: string; start?: string; end?: string;},
  tool: ITool
) {
  const calendar = getCalendarClient(tool);

  return calendar.events.patch({
    calendarId: tool.credentials.calendarId || "primary",
    eventId: args.eventId,
    requestBody: {
      summary: args.summary,
      description: args.description,
      start: { dateTime: args.start },
      end: { dateTime: args.end },
    },
  });
};

/* ========================= */

export async function delete_event(
  args: { eventId: string },
  tool: ITool
) {
  const calendar = getCalendarClient(tool);

  await calendar.events.delete({
    calendarId: tool.credentials.calendarId || "primary",
    eventId: args.eventId,
  });

  return { success: true };
};

/* ========================= */

export async function check_availability(
  args: {start: string; end: string;},
  tool: ITool
) {
  const calendar = getCalendarClient(tool);

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: args.start,
      timeMax: args.end,
      items: [{ id: tool.credentials.calendarId || "primary" }],
    },
  });

  return res.data;
};
