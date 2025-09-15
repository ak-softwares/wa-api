import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";
import { IContact } from "@/types/contact";
import UpdateContactDialog from "./UpdateContacts";
import DeleteContactDialog from "./DeleteConstacts";


interface Props {
  contacts: IContact[];
  isLoading: boolean;
  handleMessage: (contact: IContact) => void;
  handleEdit: () => void;
  handleDelete: () => void;
}

export default function ContactList({
  contacts,
  isLoading,
  handleMessage,
  handleEdit,
  handleDelete,
}: Props) {

  return (
    <div className="space-y-3">
      {isLoading ? (
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
          <p className="text-gray-500">No contacts yet. Add your first contact!</p>
        </Card>
      ) : (
        contacts.map((contact) => (
          <Card
            key={contact._id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-5">
                <div className="font-medium text-gray-900">{contact.name}</div>
                {contact.email && (
                  <div className="text-sm text-gray-500 truncate">
                    {contact.email}
                  </div>
                )}
              </div>
              <div className="col-span-12 md:col-span-4 text-gray-700">
                {contact.phone.join(", ")}
              </div>
              <div className="col-span-12 md:col-span-3">
                <div className="flex justify-start md:justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMessage(contact)}
                    title="Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  
                  {/* Edit button opens update dialog */}
                  <UpdateContactDialog
                    contact={{
                      id: contact._id,
                      name: contact.name,
                      phone: contact.phone[0],
                      email: contact.email,
                    }}
                    onContactUpdated={handleEdit}
                  />
                  <DeleteContactDialog
                    contactId={contact._id}
                    contactName={contact.name}
                    onContactDeleted={handleDelete}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
