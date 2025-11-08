export default function ContactsLayout({
  list,
  details,
}: {
  list: React.ReactNode;
  details: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      {/* Left panel (contact list) */}
      <section className="w-1/3 bg-white dark:bg-[#161717] border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        {list}
      </section>

      {/* Right panel (contact details) */}
      <section className="w-2/3 bg-white dark:bg-[#161717] overflow-y-auto">
        {details}
      </section>
    </div>
  );
}
