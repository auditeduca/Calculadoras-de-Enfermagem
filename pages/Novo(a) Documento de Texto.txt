import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import siteConfig from '../data/site.json';
import { SiteConfig } from '../data/types';
import Layout from '../components/Layout';
import Calculator from '../components/Calculator';
import SidebarTools from '../components/SidebarTools';
import Modals from '../components/Modals';

interface InsulinaPageProps {
  config: SiteConfig;
}

export default function InsulinaPage({ config }: InsulinaPageProps) {
  const pageKey = 'insulina';
  const page = config.pages[pageKey];
  const [modalOpen, setModalOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState<string | null>(null);

  const handleSidebarAction = (action: string) => {
    if (action.startsWith('switchTab')) {
      // Implementar troca de abas (se necessário)
    } else if (action.startsWith('show')) {
      const modalKey = action.replace('show', '').replace('()', '').toLowerCase();
      if (page.modals[modalKey]) {
        setCurrentModal(modalKey);
        setModalOpen(true);
      }
    }
  };

  return (
    <Layout config={config} pageKey={pageKey}>
      <SidebarTools config={page.sidebar} onAction={handleSidebarAction} />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8 md:py-12 w-full">
        <header className="max-w-4xl mb-12">
          <span className="bg-nurse-primary text-white text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 inline-block shadow-md">
            {page.header.badge}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">{page.header.title}</h1>
          <div className="h-2 w-24 bg-gradient-to-r from-nurse-accent to-nurse-primary rounded-full mb-8"></div>
          <p className="text-xl text-slate-600 dark:text-slate-300 font-medium italic">{page.header.description}</p>
        </header>

        <div className="grid lg:grid-cols-[1fr,340px] gap-10 items-start">
          <article className="card-base p-0">
            <Calculator
              config={page.calculator}
              auditSteps={page.auditSteps}
              onCalculate={(result) => console.log(result)}
            />
          </article>

          <aside className="space-y-6 sticky top-28 self-start">
            {/* Sidebar modules (desafio clínico, compartilhar, etc.) */}
            <div className="sidebar-module">
              <h3 className="border-b-2 border-white/20 pb-4 mb-5 font-bold flex items-center gap-3 text-xl text-white font-nunito">
                <i className="fa-solid fa-trophy"></i> Desafio Clínico
              </h3>
              <p className="text-sm text-white/90 mb-6 font-medium leading-relaxed">
                Teste sua agilidade e precisão em simulados reais de enfermagem.
              </p>
              <a href="https://simulados-para-enfermagem.com.br/" target="_blank" rel="noopener noreferrer"
                 className="w-full bg-white text-nurse-primary font-black py-4 rounded-xl hover:bg-slate-100 transition shadow-lg text-sm uppercase tracking-wide flex items-center justify-center gap-2 group">
                Acessar Simulados <i className="fa-solid fa-bolt text-nurse-secondary group-hover:scale-125 transition-transform"></i>
              </a>
            </div>

            <div className="sidebar-module from-cyan-600 to-nurse-secondary">
              <h3 className="border-b-2 border-white/20 pb-4 mb-5 font-bold flex items-center gap-3 text-xl text-white font-nunito">
                <i className="fa-solid fa-share-nodes"></i> Compartilhar
              </h3>
              <div className="flex gap-3 justify-center">
                <button className="share-btn" title="Compartilhar no Facebook">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button className="share-btn" title="Compartilhar no WhatsApp">
                  <i className="fab fa-whatsapp"></i>
                </button>
                <button className="share-btn" title="Compartilhar no LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </button>
                <button className="share-btn" title="Copiar Link">
                  <i className="fas fa-link"></i>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Modals
        config={page.modals}
        isOpen={modalOpen}
        modalKey={currentModal}
        onClose={() => { setModalOpen(false); setCurrentModal(null); }}
      />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      config: siteConfig,
    },
  };
};