import React from 'react';
import Head from 'next/head';
import { SiteConfig } from '../data/types';
import Accessibility from './Accessibility';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  config: SiteConfig;
  children: React.ReactNode;
  pageKey: string;
}

export default function Layout({ config, children, pageKey }: LayoutProps) {
  const page = config.pages[pageKey];
  return (
    <>
      <Head>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
        <meta name="keywords" content={page.keywords} />
        <link rel="canonical" href={`${config.site.url}${page.canonical}`} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <meta property="og:url" content={`${config.site.url}${page.canonical}`} />
        <meta property="og:image" content={`${config.site.url}${page.ogImage}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.title} />
        <meta name="twitter:description" content={page.description} />
        <meta name="twitter:image" content={`${config.site.url}${page.ogImage}`} />
        <meta name="twitter:creator" content={config.site.social.twitter} />
      </Head>
      <Accessibility />
      <Header config={config} />
      <main className="flex-grow">{children}</main>
      <Footer config={config} pageKey={pageKey} />
    </>
  );
}