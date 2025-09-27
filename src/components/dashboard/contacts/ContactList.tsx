import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateContactDialog from "./UpdateContact";
import DeleteContactDialog from "./DeleteConstact";
import ChatTab from "./ChatWithContact";
import { useContacts } from "@/hooks/useContacts"; // 👈 your custom hook

export default function ContactList() {
  const { contacts, loading, loadingMore, hasMore, refreshContacts } = useContacts();

  return (
    <div className="space-y-3">
      {loading ? (
        // Initial full-page skeletons
        Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-5">
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-32" />
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
                <div className="col-span-12 md:col-span-5">
                  <div className="font-medium">{contact.name}</div>
                  {contact.email && (
                    <div className="text-sm truncate">
                      {contact.email}
                    </div>
                  )}
                </div>
                <div className="col-span-12 md:col-span-4">
                  {contact.phones.join(", ")}
                </div>
                <div className="col-span-12 md:col-span-3">
                  <div className="flex justify-start md:justify-center gap-2">
                    <ChatTab
                      contact={{
                        name: contact.name ?? "",
                        phones: contact.phones,
                      }}
                    />

                    {/* Edit button opens update dialog */}
                    <UpdateContactDialog
                      contact={{
                        id: contact._id,
                        name: contact.name ?? "",
                        phones: contact.phones,
                        email: contact.email,
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
              </div>
            </Card>
          ))}

          {/* Extra skeletons at bottom while loading more */}
          {hasMore && loadingMore && (
            <>
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={`skeleton-${i}`} className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-5">
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-3 w-32" />
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
