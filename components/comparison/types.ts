import type React from "react";
import type { RepoVerdict } from "@/lib/analysis-results";

export interface Project {
  name: string;
  stars: number;
  url: string;
  description: string;
}

export interface Influencer {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

export interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
  verdicts?: RepoVerdict[];
  verdictTitle?: string;
  verdictDescription?: string;
}

export interface ComparisonSide {
  title: string;
  subtitle: string;
  features: string[];
  code: string;
  codeLabel: string;
  showWhitespace?: boolean;
  projects: Project[];
  influencers?: Influencer[];
  stats?: Stat[];
}

export interface BottomStat {
  icon: React.ReactNode;
  value: string;
  label: string;
  verdicts?: RepoVerdict[];
  verdictTitle?: string;
  verdictDescription?: string;
}

export interface ComparisonData {
  slug: string;
  title: string;
  description: string;
  badgeText: string;
  leftSide: ComparisonSide;
  rightSide: ComparisonSide;
  winningSide: "left" | "right";
  bottomStats?: BottomStat[];
}
