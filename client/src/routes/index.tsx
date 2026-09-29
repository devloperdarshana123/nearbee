import { createFileRoute } from "@tanstack/react-router";
import ProviderSearch from "../components/ProviderSearch";

export const Route = createFileRoute("/")({ component: ProviderListPage });

function ProviderListPage() {
  return <ProviderSearch />;
}
