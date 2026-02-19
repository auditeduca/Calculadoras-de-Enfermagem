import React from 'react';
import { SiteConfig } from '../data/types';

interface FooterProps {
  config: SiteConfig;
  pageKey: string;
}

const Footer: React.FC<FooterProps> = ({ config, pageKey }) => {
  const page = config.pages[pageKey];
  return (
    <footer className="bg-white dark:bg-nurse-bgDark border-t border-slate-200 dark:border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
            <i className="fa-solid fa-tags mr-2"></i> Tópicos:
          </span>
          {page.footer.tags.map((tag, idx) => (
            <span key={idx} className="tag-pill-footer">{tag}</span>
          ))}
        </div>
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} {config.site.name}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;