export default function PageSubheader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
      {subtitle && (
        <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
} 