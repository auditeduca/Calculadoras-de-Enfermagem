import React, { useEffect, useState } from 'react';
import { Modals as ModalsConfig } from '../data/types';

interface ModalsProps {
  config: ModalsConfig;
  isOpen: boolean;
  modalKey: string | null;
  onClose: () => void;
}

export default function Modals({ config, isOpen, modalKey, onClose }: ModalsProps) {
  const [modalData, setModalData] = useState<any>(null);

  useEffect(() => {
    if (modalKey && config[modalKey]) {
      setModalData(config[modalKey]);
    }
  }, [modalKey, config]);

  if (!isOpen || !modalData) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center" role="dialog" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-4 flex flex-col">
        <div className="bg-nurse-primary dark:bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className={`fa-solid ${modalData.icon} text-2xl`}></i>
            <h3 id="modal-title" className="text-xl font-bold font-nunito">{modalData.title}</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-nurse-secondary text-xl">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow text-sm" dangerouslySetInnerHTML={{ __html: modalData.content }} />
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="w-full bg-nurse-accent hover:bg-nurse-primary text-white font-bold py-3 rounded-xl transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}