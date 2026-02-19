import React from 'react';
import { Sidebar } from '../data/types';

interface SidebarToolsProps {
  config: Sidebar;
  onAction: (action: string) => void;
}

export default function SidebarTools({ config, onAction }: SidebarToolsProps) {
  return (
    <aside className="sidebar-left-tools" id="sidebar-tools">
      {config.tools.map((tool) => (
        <button
          key={tool.id}
          className="tool-btn"
          onClick={() => onAction(tool.action)}
          aria-label={tool.label}
          title={tool.label}
        >
          <i className={`fas ${tool.icon}`} aria-hidden="true"></i>
          <span className="btn-label">{tool.label}</span>
        </button>
      ))}
    </aside>
  );
}