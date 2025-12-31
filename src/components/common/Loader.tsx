export function Loader({ size = 48 }: { size?: number }) {
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 animate-ping rounded-full bg-[#00a884]/30" />
      <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#00a884]" />
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

export function CenterLoader() {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <Loader />
    </div>
  );
}
