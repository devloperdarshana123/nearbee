import { Link } from "@tanstack/react-router";
import { Show } from "@clerk/tanstack-react-start";
import logo from "../logo.png";

const exploreLinks = [
  { to: "/", label: "Find Providers" },
  { to: "/provider/dashboard", label: "Become a Provider" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
];

const legalLinks = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
];

const signedOutAccountLinks = [
  { to: "/login", label: "Sign in" },
  { to: "/signup", label: "Sign up" },
];

const signedInAccountLinks = [
  { to: "/profile", label: "My Profile" },
  { to: "/bookings", label: "My Bookings" },
  { to: "/favorites", label: "Saved Providers" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer mt-20 px-4 pb-8 pt-12">
      <div className="page-wrap">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <img src={logo} alt="NearBee" className="h-14 w-auto" />
            <p className="mt-3 max-w-xs text-sm text-[var(--sea-ink-soft)]">
              Find trusted local plumbers, electricians, tutors, and more — book in minutes,
              no more digging through WhatsApp groups.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Explore
            </p>
            <ul className="space-y-2 text-sm">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--sea-ink)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Legal
            </p>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--sea-ink)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Account
            </p>
            <ul className="space-y-2 text-sm">
              <Show when="signed-out">
                {signedOutAccountLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--sea-ink)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </Show>
              <Show when="signed-in">
                {signedInAccountLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--sea-ink)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </Show>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] pt-6 text-xs text-[var(--sea-ink-soft)] sm:flex-row">
          <p className="m-0">&copy; {year} NearBee. All rights reserved.</p>
          <p className="m-0">Made for local communities.</p>
        </div>
      </div>
    </footer>
  );
}
