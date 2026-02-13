import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison";
import { allComparisons } from "@/lib/comparisons";

export const dynamic = "error";
export const dynamicParams = false;

export function generateStaticParams() {
  return allComparisons.map((comparison) => ({
    comparison: comparison.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ comparison: string }>;
}): Promise<Metadata> {
  const { comparison } = await params;
  const data = allComparisons.find((c) => c.slug === comparison);

  if (!data) {
    return {
      title: "Not Found",
    };
  }

  const winningSide =
    data.winningSide === "left" ? data.leftSide : data.rightSide;
  const losingSide =
    data.winningSide === "left" ? data.rightSide : data.leftSide;

  const winningPercentage = winningSide.stats?.[0]?.value ?? "";
  const losingPercentage = losingSide.stats?.[0]?.value ?? "";

  const metaDescription = `${data.description} ${winningPercentage} of top TypeScript projects use ${winningSide.title.replace("Team ", "")}, while ${losingPercentage} prefer ${losingSide.title.replace("Team ", "")}.`;

  return {
    title: data.title,
    description: metaDescription,
    openGraph: {
      title: data.title,
      description: metaDescription,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: metaDescription,
    },
  };
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
