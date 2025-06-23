import Image from "next/image";
import PaneTitle from "@/components/PaneTitle";
import maxsM from "@/public/maxsM.png";

const EmptyCard = ({ title }: { title: string }) => (
  <div className="relative flex-1 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 p-4 min-h-[160px]">
    <PaneTitle className="relative z-10">{title}</PaneTitle>
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <Image
        src={maxsM}
        alt="MP Shield"
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
    </div>
  </div>
);

export default EmptyCard; 