import { z } from "zod";
import * as contacts from "./googleContacts";
import { ActionConfig } from "@/types/Tool";

export const GOOGLE_CONTACTS: Record<string, ActionConfig> = {
  /* =========================
     CREATE CONTACT
  ========================= */
  create_contact: {
    title: "Create Contact",
    description: "Create a new Google contact",
    schema: z.object({
      firstName: z.string(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      notes: z.string().optional(),
    }),
    execute: contacts.create_contact,
  },

  /* =========================
     LIST CONTACTS
  ========================= */
  list_contacts: {
    title: "List Contacts",
    description: "Fetch all contacts",
    schema: z.object({
      limit: z.number().optional(),
    }),
    execute: contacts.list_contacts,
  },

  /* =========================
     GET CONTACT
  ========================= */
  get_contact: {
    title: "Get Contact",
    description: "Get contact details by ID",
    schema: z.object({
      resourceName: z.string(), // people/c12345
    }),
    execute: contacts.get_contact,
  },

  /* =========================
     UPDATE CONTACT
  ========================= */
  update_contact: {
    title: "Update Contact",
    description: "Update an existing contact",
    schema: z.object({
      resourceName: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      notes: z.string().optional(),
    }),
    execute: contacts.update_contact,
  },

  /* =========================
     DELETE CONTACT
  ========================= */
  delete_contact: {
    title: "Delete Contact",
    description: "Delete a contact",
    schema: z.object({
      resourceName: z.string(),
    }),
    execute: contacts.delete_contact,
  },

  /* =========================
     SEARCH CONTACTS
  ========================= */
  search_contacts: {
    title: "Search Contacts",
    description: "Search contacts by name, email, or phone",
    schema: z.object({
      query: z.string(),
      limit: z.number().optional(),
    }),
    execute: contacts.search_contacts,
  },
};
