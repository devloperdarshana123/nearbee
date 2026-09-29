export default function ProviderCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-[var(--chip-line)]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded bg-[var(--chip-line)]" />
          <div className="h-3 w-1/3 rounded bg-[var(--chip-line)]" />
        </div>
      </div>
      <div className="mt-4 h-3 w-1/2 rounded bg-[var(--chip-line)]" />
      <div className="mt-2 h-3 w-1/3 rounded bg-[var(--chip-line)]" />
      <div className="mt-3 h-5 w-24 rounded-full bg-[var(--chip-line)]" />
    </div>
  );
}
