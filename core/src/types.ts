// Shape of the content the builder stores and every generated site renders.
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export interface Section {
  id: string;
  type: string;
  data: Record<string, any>;
  style: Record<string, any>;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  seoImage: string;
  hideHeader: boolean;
  hideFooter: boolean;
  bodyClass: string;
  css: string;
  blocks: Section[];
}

/** settings[group][key], e.g. settings.theme.primary. Groups are defined in content/siteSettings. */
export type SiteSettings = Record<string, Record<string, any>>;

export interface Site {
  id: string;
  settings: SiteSettings;
  pages: Page[];
  createdAt?: string;
  updatedAt?: string;
}

export type RenderMode = 'live' | 'preview' | 'export';

export interface Response {
  status: number;
  contentType: string;
  body: string;
}
