import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

const sections = [
  {
    title: "Using NearBee",
    body: "NearBee connects customers with independent local service providers. We are a platform that facilitates discovery and booking — we are not the employer of any provider and are not a party to the service agreement between you and a provider.",
  },
  {
    title: "Accounts",
    body: "You must provide accurate information when creating an account and keep your login credentials secure. You are responsible for all activity under your account.",
  },
  {
    title: "Bookings and Payments",
    body: "Prices shown by providers are set by the providers themselves. Payment terms are agreed between the customer and provider unless stated otherwise. NearBee is not responsible for disputes over pricing or payment made outside the platform.",
  },
  {
    title: "Provider Responsibilities",
    body: "Providers are responsible for the quality, safety, and legality of the services they offer. Providers must not misrepresent their skills, pricing, or availability.",
  },
  {
    title: "Prohibited Conduct",
    body: "You may not use NearBee for fraud, harassment, spam, or any unlawful purpose. Accounts violating these terms may be suspended or banned.",
  },
  {
    title: "Limitation of Liability",
    body: "NearBee is provided \"as is\". We do not guarantee the conduct, quality, or reliability of any customer or provider. To the fullest extent permitted by law, NearBee is not liable for damages arising from services booked through the platform.",
  },
  {
    title: "Changes to These Terms",
    body: "We may update these Terms from time to time. Continued use of NearBee after changes are posted means you accept the updated Terms.",
  },
];

function TermsPage() {
  return (
    <div className="page-wrap px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--sea-ink)]">Terms of Service</h1>
        <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">Last updated: September 2026</p>

        <p className="mt-6 text-[var(--sea-ink-soft)]">
          These Terms of Service govern your use of NearBee. By creating an account or using the
          platform, you agree to these terms.
        </p>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-bold text-[var(--sea-ink)]">{section.title}</h2>
              <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">{section.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-[var(--sea-ink-soft)]">
          Questions about these terms? Contact us at{" "}
          <a href="mailto:support@nearbee.app" className="font-semibold text-[var(--lagoon-deep)]">
            support@nearbee.app
          </a>
          .
        </p>
      </div>
    </div>
  );
}
