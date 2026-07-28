export default function Spinner({
  label,
  className = 'h-12 w-12',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div role="status" className="flex flex-col items-center gap-4">
      <div
        className={`${className} rounded-full border-[3px] border-dust`}
        style={{
          borderTopColor: 'var(--color-amber)',
          animation: 'ds-spin 0.8s linear infinite',
        }}
      />
      {label && <p className="text-base text-stone">{label}</p>}
      <span className="sr-only">Cargando</span>
    </div>
  );
}
