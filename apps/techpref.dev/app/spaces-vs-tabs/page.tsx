import { ComparisonPage } from "@/components/comparison";
import { spacesVsTabsData } from "@/lib/comparisons";

export default function SpacesVsTabsPage() {
  return <ComparisonPage data={spacesVsTabsData} />;
}
