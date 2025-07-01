import Image from "next/image";
import PaneTitle from "@/components/PaneTitle";
import maxsM from "@/public/maxsM.png";

interface EmptyCardProps {
  title: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  titleClassName?: string;
  fixedHeight?: boolean;
  bare?: boolean;
}

const EmptyCard = ({
  title,
  message,
  action,
  icon,
  titleClassName,
  fixedHeight,
  bare = false,
}: EmptyCardProps) => (
  <div className={
    bare
      ? `flex flex-col flex-1 items-center justify-center min-h-[160px] ${fixedHeight ? 'h-96' : ''}`
      : `relative flex-1 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 p-4 min-h-[160px] ${fixedHeight ? 'h-96' : ''}`
  }>
    <PaneTitle className={`relative z-10 text-center ${titleClassName || ''}`}>{title}</PaneTitle>
    {message && <div className="text-zinc-400 text-center mt-2 mb-4">{message}</div>}
    <div className="flex flex-col items-center justify-center">
      {icon ?? (
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
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  </div>
);

export default EmptyCard; 