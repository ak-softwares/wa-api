import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateContactDialog from "./UpdateContact";
import DeleteContactDialog from "./DeleteConstact";
import ChatTab from "./ChatWithContact";
import { useContacts } from "@/hooks/constact/useContacts";
import { User2 } from "lucide-react";
import ContactAvatar from "./ContactAvatar";

export default function ContactList() {
  const { contacts, loading, loadingMore, hasMore, refreshContacts } = useContacts();

  return (
    <div className="space-y-3">
      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="col-span-12 md:col-span-3 flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </Card>
        ))
      ) : contacts.length === 0 ? (
        <Card className="p-8 text-center">
          <p>No contacts yet. Add your first contact!</p>
        </Card>
      ) : (
        <>
          {contacts.map((contact) => (
            <Card
              key={contact._id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <ContactAvatar
                  imageUrl={contact.imageUrl}
                  title={contact.name}
                  subtitle={contact.email}
                />
                <div className="col-span-12 md:col-span-4">
                  {contact.phones.join(", ")}
                </div>
                <div className="col-span-12 md:col-span-3 flex justify-start md:justify-center gap-2">
                  <ChatTab
                    contact={{
                      name: contact.name ?? "",
                      phones: contact.phones,
                    }}
                  />

                  <UpdateContactDialog
                    contact={{
                      id: contact._id,
                      name: contact.name ?? "",
                      phones: contact.phones,
                      email: contact.email,
                      // imageUrl: contact.imageUrl,
                    }}
                    onContactUpdated={refreshContacts}
                  />

                  <DeleteContactDialog
                    contactId={contact._id}
                    contactName={contact.name ?? ""}
                    onContactDeleted={refreshContacts}
                  />
                </div>
              </div>
            </Card>
          ))}

          {hasMore && loadingMore && (
            <>
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={`skeleton-${i}`} className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-40 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-4">
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="col-span-12 md:col-span-3 flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
