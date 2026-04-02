import React from 'react';
import type { LucideIcon } from 'lucide-react';
import './PageTitle.css';

interface PageTitleProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="page-title">
      <Icon size={24} className="page-title-icon" />
      <div className="page-title-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageTitle;