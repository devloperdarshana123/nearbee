import { Link } from "@tanstack/react-router";
import { Show, SignInButton, UserButton } from "@clerk/tanstack-react-start";
import { useMarketplaceAuth } from "../hooks/useMarketplaceAuth";
import logo from "../logo.png";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { user } = useMarketplaceAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-xl">
      <nav className="page-wrap flex flex-wrap items-center gap-x-4 gap-y-2 py-3 sm:py-4">
        <Link to="/" className="group flex flex-shrink-0 items-center no-underline">
          <img
            src={logo}
            alt="NearBee"
            className="h-14 w-auto transition group-hover:scale-105"
          />
        </Link>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-1 gap-y-1 pb-1 text-sm font-semibold sm:order-none sm:ml-6 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link to="/" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
            Find Providers
          </Link>
          <Show when="signed-in">
            <Link
              to="/provider/dashboard"
              className="nav-link"
              activeProps={{ className: "nav-link is-active" }}
            >
              {user?.role === "provider" ? "My Business" : "Become a Provider"}
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
                Admin
              </Link>
            )}
            <Link to="/bookings" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
              My Bookings
            </Link>
            <Link to="/favorites" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
              Saved
            </Link>
          </Show>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Show when="signed-in">
            <NotificationBell />
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-9 w-9 ring-2 ring-[var(--chip-line)]",
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link label="My Profile" href="/profile" labelIcon={<span>👤</span>} />
              </UserButton.MenuItems>
            </UserButton>
          </Show>
          <Show when="signed-out">
            <SignInButton>
              <button
                type="button"
                className="rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(50,143,151,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(50,143,151,0.42)]"
              >
                Sign in
              </button>
            </SignInButton>
          </Show>
        </div>
      </nav>
    </header>
  );
}
