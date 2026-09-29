import { Link } from "@tanstack/react-router";

export default function NotFound() {
  return (
    <div className="page-wrap flex flex-col items-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--lagoon-deep)]">
        404
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
        This page wandered off
      </h1>
      <p className="mt-3 max-w-sm text-sm text-[var(--sea-ink-soft)]">
        We couldn't find what you were looking for. It may have moved, or the link might be
        broken.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-[0_8px_20px_rgba(50,143,151,0.32)] transition hover:-translate-y-0.5"
      >
        Back to NearBee
      </Link>
    </div>
  );
}
