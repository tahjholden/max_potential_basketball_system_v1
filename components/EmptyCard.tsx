import PaneTitle from "@/components/PaneTitle";

const EmptyCard = ({ title }: { title: string }) => (
  <div className="relative flex-1 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 p-4">
    <PaneTitle className="relative z-10">{title}</PaneTitle>
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <img
        src="/maxsM.png"
        alt="MP Logo"
        className="h-[400px] w-[400px] object-contain opacity-50"
      />
    </div>
  </div>
);

export default EmptyCard; 