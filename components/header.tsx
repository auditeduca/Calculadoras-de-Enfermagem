import React, { useState } from 'react';
import Link from 'next/link';
import { SiteConfig } from '../data/types';

interface HeaderProps {
  config: SiteConfig;
}

const Header: React.FC<HeaderProps> = ({ config }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-nurse-bgDark shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src={config.site.logo} alt={config.site.name} className="h-10 w-10 rounded-full" />
          <span className="font-bold text-nurse-primary dark:text-cyan-400 hidden sm:inline">
            {config.site.name}
          </span>
        </Link>

        {/* Menu desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/insulina" className="font-medium hover:text-nurse-secondary">Insulina</Link>
          <Link href="/heparina" className="font-medium hover:text-nurse-secondary">Heparina</Link>
          <Link href="/gotejamento" className="font-medium hover:text-nurse-secondary">Gotejamento</Link>
          {/* Mais links */}
        </nav>

        {/* Botão menu mobile */}
        <button
          className="md:hidden hamburger-menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-4">
          <nav className="flex flex-col gap-3">
            <Link href="/insulina" onClick={() => setMobileMenuOpen(false)}>Insulina</Link>
            <Link href="/heparina" onClick={() => setMobileMenuOpen(false)}>Heparina</Link>
            <Link href="/gotejamento" onClick={() => setMobileMenuOpen(false)}>Gotejamento</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;