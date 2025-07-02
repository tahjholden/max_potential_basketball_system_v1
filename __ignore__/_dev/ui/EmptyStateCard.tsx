import Image from "next/image";

export default function EmptyStateCard({
  message,
  alt = "MP Shield",
}: {
  message: string;
  alt?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-8 flex flex-col items-center justify-center min-h-[120px]">
      <Image
        src="/maxsM.png"
        alt={alt}
        width={220}
        height={120}
        priority
        style={{
          objectFit: "contain",
          width: "100%",
          height: "100%",
          maxWidth: "220px",
          maxHeight: "120px",
          display: "block",
          margin: "0 auto",
          filter: "drop-shadow(0 2px 12px #2226)",
          opacity: 0.75,
          transform: "scale(3)",
        }}
      />
      <div className="text-zinc-400 text-center font-semibold mt-4">{message}</div>
    </div>
  );
} 