export function Loader() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-ping rounded-full bg-[#00a884]/30" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#00a884]" />
      </div>
    </div>
  );
}
export function FullPageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader />
    </div>
  );
}