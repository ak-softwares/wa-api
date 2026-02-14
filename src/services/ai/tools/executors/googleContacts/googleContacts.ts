import { google } from "googleapis";
import { ITool } from "@/models/Tool";

/* =========================
   CLIENT
========================= */

function getContactsClient(tool: ITool) {
  const creds = tool.credentials;

  const oauth2Client = new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: creds.access_token,
    refresh_token: creds.refresh_token,
    expiry_date: Number(creds.expiry_date),
  });

  return google.people({ version: "v1", auth: oauth2Client });
}

/* =========================
   CREATE CONTACT
========================= */

export async function create_contact(
  args: { firstName: string; lastName?: string; email?: string; company?: string; phone?: string; notes?: string },
  tool: ITool
) {
  const people = getContactsClient(tool);

  const res = await people.people.createContact({
    requestBody: {
      names: [
        {
          givenName: args.firstName,
          familyName: args.lastName,
        },
      ],
      emailAddresses: args.email
        ? [{ value: args.email }]
        : undefined,
      phoneNumbers: args.phone
        ? [{ value: args.phone }]
        : undefined,
      organizations: args.company
        ? [{ name: args.company }]
        : undefined,
      biographies: args.notes
        ? [{ value: args.notes }]
        : undefined,
    },
  });

  return res.data;
};

/* =========================
   LIST CONTACTS
========================= */

export async function list_contacts(
  args: { limit?: number },
  tool: ITool
) {
  const people = getContactsClient(tool);

  const res = await people.people.connections.list({
    resourceName: "people/me",
    pageSize: args.limit ?? 20,
    personFields: "names,emailAddresses,phoneNumbers,organizations",
  });

  return res.data.connections || [];
};

/* =========================
   GET CONTACT
========================= */

export async function get_contact(
  args: { resourceName: string },
  tool: ITool
) {
  const people = getContactsClient(tool);

  const res = await people.people.get({
    resourceName: args.resourceName, // people/c12345
    personFields:
      "names,emailAddresses,phoneNumbers,organizations,biographies",
  });

  return res.data;
};

/* =========================
   UPDATE CONTACT
========================= */

export async function update_contact(
  args: { resourceName: string; firstName?: string; lastName?: string; email?: string; company?: string; phone?: string; notes?: string },
  tool: ITool
) {
  const people = getContactsClient(tool);

  const res = await people.people.updateContact({
    resourceName: args.resourceName,
    updatePersonFields:
      "names,emailAddresses,phoneNumbers,organizations,biographies",
    requestBody: {
      names: args.firstName
        ? [{ givenName: args.firstName, familyName: args.lastName }]
        : undefined,
      emailAddresses: args.email
        ? [{ value: args.email }]
        : undefined,
      phoneNumbers: args.phone
        ? [{ value: args.phone }]
        : undefined,
      organizations: args.company
        ? [{ name: args.company }]
        : undefined,
      biographies: args.notes
        ? [{ value: args.notes }]
        : undefined,
    },
  });

  return res.data;
};

/* =========================
   DELETE CONTACT
========================= */

export async function delete_contact(
  args: { resourceName: string },
  tool: ITool
) {
  const people = getContactsClient(tool);

  await people.people.deleteContact({
    resourceName: args.resourceName,
  });

  return { success: true };
};

/* =========================
   SEARCH CONTACTS
========================= */

export async function search_contacts(
  args: { query: string; limit?: number },
  tool: ITool
) {
  const people = getContactsClient(tool);

  const res = await people.people.searchContacts({
    query: args.query,
    pageSize: args.limit ?? 10,
    readMask: "names,emailAddresses,phoneNumbers,organizations",
  });

  return res.data.results || [];
};
