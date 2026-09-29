import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="page-wrap px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--sea-ink)]">About NearBee</h1>
        <p className="mt-4 text-[var(--sea-ink-soft)]">
          NearBee helps you find trusted local service providers — plumbers, electricians, tutors,
          cleaners, and more — without digging through WhatsApp groups or asking around the
          neighborhood. We connect customers with verified providers in their area so bookings can
          happen in minutes, not days.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { title: "Our Mission", body: "Make finding reliable local help as easy as ordering food online." },
            { title: "Who We Serve", body: "Everyday customers and independent local professionals looking for steady work." },
            { title: "Why NearBee", body: "Verified profiles, transparent reviews, and simple booking — no middlemen, no guesswork." },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
            >
              <h2 className="text-sm font-semibold text-[var(--lagoon-deep)]">{item.title}</h2>
              <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-bold text-[var(--sea-ink)]">How it works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
            <li>Search for a service and browse verified local providers.</li>
            <li>Compare profiles, ratings, and reviews from other customers.</li>
            <li>Book directly through NearBee and track your appointment.</li>
          </ol>
        </div>

        <p className="mt-10 text-sm text-[var(--sea-ink-soft)]">
          Have questions or feedback? We'd love to hear from you at{" "}
          <a href="mailto:support@nearbee.app" className="font-semibold text-[var(--lagoon-deep)]">
            support@nearbee.app
          </a>
          . You can also{" "}
          <Link to="/" className="font-semibold text-[var(--lagoon-deep)]">
            start exploring providers
          </Link>{" "}
          right away.
        </p>
      </div>
    </div>
  );
}
