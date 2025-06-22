export default function PageSubheader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-0">
      <h1 className="text-xl font-semibold text-zinc-100 mb-0">{title}</h1>
      {subtitle && (
        <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
} 