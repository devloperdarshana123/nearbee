import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { submitContactForm } from "../services/contactService";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitContactForm(form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="page-wrap px-6 py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--sea-ink)]">Contact Us</h1>
        <p className="mt-3 text-[var(--sea-ink-soft)]">
          Have a question, feedback, or need help with a booking? Send us a message and we'll get
          back to you.
        </p>

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
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
              Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm"
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
          )}
          {status === "sent" && (
            <p className="text-sm text-[var(--palm)]">Message sent! We'll get back to you soon.</p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full bg-[linear-gradient(135deg,var(--lagoon),var(--lagoon-deep))] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(50,143,151,0.32)] transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {status === "sending" ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
