import { google } from "googleapis";
import { ContactModel, IContact } from "@/models/Contact";
import { Types } from "mongoose";

type Props = {
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
  tokens: any;
};

export async function importGoogleContacts({
  userId,
  waAccountId,
  tokens,
}: Props): Promise<number> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials(tokens);

  const people = google.people({ version: "v1", auth: oauth2Client });

  // ✅ fetch all pages
  let allConnections: any[] = [];
  let nextPageToken: string | undefined;

  do {
    const res: any = await people.people.connections.list({
      resourceName: "people/me",
      personFields: "names,emailAddresses,photos,phoneNumbers",
      pageSize: 1000,
      pageToken: nextPageToken,
    });

    if (res.data.connections) {
      allConnections = allConnections.concat(res.data.connections);
    }

    nextPageToken = res.data.nextPageToken ?? undefined;
  } while (nextPageToken);

  // ✅ map contacts
  let contactsToInsert: Partial<IContact>[] = allConnections.map((c) => ({
    userId,
    waAccountId,
    name: c.names?.[0]?.displayName,
    email: c.emailAddresses?.[0]?.value,
    phones:
      c.phoneNumbers
        ?.map((p: any) => p.canonicalForm?.replace(/^\+/, "") || p.value)
        .filter(Boolean) || [],
    imageUrl: c.photos?.[0]?.url,
    tags: ["Google contact"],
  }));

  // ✅ remove empty phones
  contactsToInsert = contactsToInsert.filter((c) => c.phones?.length);

  // ✅ remove duplicates
  const allPhones = contactsToInsert.flatMap((c) => c.phones || []);

  const existing = await ContactModel.find({
    userId,
    waAccountId,
    phones: { $in: allPhones },
  }).select("phones");

  const existingPhones = new Set(existing.flatMap((c) => c.phones || []));

  contactsToInsert = contactsToInsert.filter(
    (c) => !c.phones?.some((p) => existingPhones.has(p))
  );

  if (contactsToInsert.length) {
    await ContactModel.insertMany(contactsToInsert, { ordered: false });
  }

  return contactsToInsert.length; // ✅ return count only
}
