import React from 'react';
import Header from './Header';
import SearchBar from './SearchBar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <div className="search-container">
        <SearchBar className=''/>
      </div>
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;