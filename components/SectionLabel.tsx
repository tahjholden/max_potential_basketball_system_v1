export default function SectionLabel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`font-bold text-base text-white -mb-2 z-10 px-2 bg-zinc-950 w-fit ${className}`}>
      {children}
    </span>
  );
} 