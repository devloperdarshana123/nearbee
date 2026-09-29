import { Link, createFileRoute } from "@tanstack/react-router";
import ProviderSearch, { CATEGORIES } from "../components/ProviderSearch";

export const Route = createFileRoute("/category/$name")({ component: CategoryPage });

function CategoryPage() {
  const { name } = Route.useParams();
  const decoded = decodeURIComponent(name);
  const category = CATEGORIES.find((c) => c.label.toLowerCase() === decoded.toLowerCase());

  return (
    <div>
      <section className="page-wrap px-6 pb-6 pt-14 text-center sm:pt-20">
        <Link
          to="/"
          className="text-sm text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
        >
          ← All categories
        </Link>
        <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          {category ? `${category.emoji} ${category.label}` : decoded} near you
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Compare Trust Scores and book a {decoded.toLowerCase()} in your area.
        </p>
      </section>
      <ProviderSearch initialCategory={decoded} showHero={false} />
    </div>
  );
}
