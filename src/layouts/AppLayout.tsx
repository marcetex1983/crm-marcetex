import React from 'react';
import Sidebar from '../components/Sidebar';
import './Layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
