import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison";
import { allComparisons } from "@/lib/comparisons";

export function generateStaticParams() {
  return allComparisons.map((comparison) => ({
    comparison: comparison.slug,
  }));
}

export default async function ComparisonRoute({
  params,
}: {
  params: Promise<{ comparison: string }>;
}) {
  const { comparison } = await params;
  const data = allComparisons.find((c) => c.slug === comparison);

  if (!data) {
    notFound();
  }

  return <ComparisonPage data={data} />;
}
