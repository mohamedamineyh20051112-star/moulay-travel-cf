import TopDestinations from "@/components/TopDestinations";

export default function TopDestinationsPage() {
  return (
    <div className="pt-24"> {/* Add padding top because of fixed header */}
      <TopDestinations showEmptyFallback />
    </div>
  );
}
