import type React from "react";

export interface Project {
  name: string;
  stars: string;
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
}

export interface ComparisonSide {
  title: string;
  subtitle: string;
  badge: string;
  features: string[];
  code: string;
  codeLabel: string;
  projects: Project[];
  influencers: Influencer[];
  stats: Stat[];
}

export interface ComparisonData {
  slug: string;
  title: string;
  description: string;
  badgeText: string;
  leftSide: ComparisonSide;
  rightSide: ComparisonSide;
  bottomStats: {
    icon: React.ReactNode;
    value: string;
    label: string;
  }[];
  conclusion: {
    title: string;
    description: string;
    tools: string[];
  };
}
