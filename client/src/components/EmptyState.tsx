import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--line)] px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--lagoon)_14%,transparent)] text-[var(--lagoon-deep)]">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[var(--sea-ink)]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--sea-ink-soft)]">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
