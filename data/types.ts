export interface SiteConfig {
  site: SiteInfo;
  pages: Record<string, PageConfig>;
  global: GlobalConfig;
}

export interface SiteInfo {
  name: string;
  url: string;
  logo: string;
  author: string;
  social: {
    twitter: string;
  };
}

export interface PageConfig {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage: string;
  header: {
    badge: string;
    title: string;
    description: string;
  };
  calculator: CalculatorConfig;
  auditSteps: AuditStep[];
  checklists: Checklists;
  modals: Modals;
  sidebar: Sidebar;
  footer: {
    tags: string[];
  };
}

export interface CalculatorConfig {
  fields: CalculatorField[];
  formula: string;
}

export type CalculatorField = {
  id: string;
  label: string;
  type: 'number' | 'select' | 'text' | 'date';
  placeholder?: string;
  required?: boolean;
  min?: number;
  step?: number;
  tooltip?: string;
  options?: { value: string | number; label: string }[];
  default?: string | number;
};

export interface AuditStep {
  label: string;
  icon: string;
  value?: string;
}

export interface Checklists {
  noveCertos: string[];
  metas: { id: number; text: string; class: string }[];
}

export interface Modals {
  [key: string]: {
    title: string;
    icon: string;
    content: string;
  };
}

export interface Sidebar {
  tools: { id: string; icon: string; label: string; action: string }[];
}

export interface GlobalConfig {
  accessibility: {
    fontSize: string;
    highContrast: boolean;
  };
  analytics: {
    enabled: boolean;
    gtag: string;
  };
}