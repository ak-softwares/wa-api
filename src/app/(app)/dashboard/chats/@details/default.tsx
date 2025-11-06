export default function DefaultDetails() {
  return (
      <div className="flex flex-col items-center justify-center h-full">
        <img
          src="/assets/icons/empty-chat.svg"
          alt="chat"
          className="w-60 h-60"
        />
        <h1 className="text-3xl mb-2">
          Whatsapp API on Web 
        </h1>
        <p className="text-gray-400 text-sm">
          Organise and manage you api account
        </p>
        <p className="flex items-center gap-1 text-gray-400 text-sm absolute bottom-10">
          <img
            src="/assets/icons/lock.svg"
            alt="chat"
            className="w-5 h-5 dark:invert opacity-70"
          />
          Your personal message are end-to-end encypted
        </p>
      </div>
  );
}
