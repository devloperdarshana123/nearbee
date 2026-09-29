import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-react-start";
import { useMarketplaceAuth } from "../hooks/useMarketplaceAuth";
import ProtectedRoute from "../components/ProtectedRoute";
import ReferralCard from "../components/ReferralCard";

export const Route = createFileRoute("/profile")({
  component: () => (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  ),
});

const roleLabels: Record<string, string> = {
  customer: "Customer",
  provider: "Service Provider",
  admin: "Admin",
};

function ProfilePage() {
  const { user, updateProfile, isUpdatingProfile, profileError } = useMarketplaceAuth();
  const { user: clerkUser } = useUser();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone ?? "" });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaved(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(form);
    setSaved(true);
  };

  if (!user) return null;

  return (
    <div className="page-wrap px-6 py-12">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center gap-4">
          {clerkUser?.imageUrl && (
            <img
              src={clerkUser.imageUrl}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--sea-ink)]">
              My Profile
            </h1>
            <span className="mt-1 inline-block rounded-full bg-[color-mix(in_oklab,var(--lagoon)_14%,transparent)] px-3 py-0.5 text-xs font-semibold text-[var(--lagoon-deep)]">
              {roleLabels[user.role] ?? user.role}
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Add a phone number"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Email
            </label>
            <input
              value={user.email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--line)_25%,transparent)] px-3 py-2.5 text-sm text-[var(--sea-ink-soft)]"
            />
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
              Managed by your sign-in account and can't be changed here.
            </p>
          </div>

          {profileError && (
            <p className="text-sm text-red-600">
              {profileError.response?.data?.message || "Failed to update profile"}
            </p>
          )}
          {saved && !isUpdatingProfile && (
            <p className="text-sm text-[var(--palm)]">Profile updated!</p>
          )}

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(50,143,151,0.32)] transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isUpdatingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>

        <ReferralCard />
      </div>
    </div>
  );
}
