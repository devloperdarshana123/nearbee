import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

const sections = [
  {
    title: "Information We Collect",
    body: "When you create an account, we collect your name, email address, and phone number. If you become a provider, we also collect your service details and location. Booking activity, messages, and reviews are stored to operate the platform.",
  },
  {
    title: "How We Use Your Information",
    body: "We use your information to connect customers with providers, process bookings, send booking-related notifications, and improve NearBee. We do not sell your personal data to third parties.",
  },
  {
    title: "Sharing of Information",
    body: "Your name and relevant booking details are shared with the provider or customer involved in a booking so the service can be arranged. We may share data with service providers who help us run NearBee (such as hosting, email, and authentication providers) under confidentiality obligations.",
  },
  {
    title: "Data Security",
    body: "We use industry-standard measures, including secure authentication and encrypted connections, to protect your data. No system is completely secure, so we encourage you to use a strong password and keep your account credentials private.",
  },
  {
    title: "Your Choices",
    body: "You can update or correct your profile information at any time from My Profile. You may request deletion of your account and associated data by contacting us.",
  },
  {
    title: "Cookies",
    body: "We use essential cookies and local storage to keep you signed in and remember your preferences. We do not use third-party advertising trackers.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this policy from time to time. Continued use of NearBee after changes means you accept the updated policy.",
  },
];

function PrivacyPage() {
  return (
    <div className="page-wrap px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--sea-ink)]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">Last updated: September 2026</p>

        <p className="mt-6 text-[var(--sea-ink-soft)]">
          This Privacy Policy explains how NearBee ("we", "us") collects, uses, and protects your
          information when you use our platform to find or offer local services.
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
          Questions about this policy? Contact us at{" "}
          <a href="mailto:privacy@nearbee.app" className="font-semibold text-[var(--lagoon-deep)]">
            privacy@nearbee.app
          </a>
          .
        </p>
      </div>
    </div>
  );
}
