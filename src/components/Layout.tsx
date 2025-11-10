import React from 'react';
import '../index.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-container">
      <div className="form-card">
        {children}
      </div>
    </div>
  );
};

export default Layout;
