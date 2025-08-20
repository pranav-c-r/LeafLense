import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const { theme } = useTheme();

  return (
    <header className={`py-4 px-6 flex flex-col sm:flex-row items-center justify-between shadow-md transition-colors duration-300
      ${theme === 'dark-theme' ? 'bg-gray-800' : 'bg-white'}`}>
      
      {/* Logo and title container */}
      <div className="flex items-center space-x-2">
        <Link to="/" className="flex items-center">
          {/* Using a placeholder SVG icon for the logo */}
          <svg className={`h-8 w-8 transition-colors duration-300
            ${theme === 'dark-theme' ? 'text-green-400' : 'text-green-600'}`}
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm-1 16c-2.2-.4-4-2.3-4-4.5V11c0-2.2 1.8-4 4-4s4 1.8 4 4v2.5c0 2.2-1.8 4.1-4 4.5zm-2-7.5V11a2 2 0 012-2 2 2 0 012 2v-.5c0-1.1-.9-2-2-2a2 2 0 00-2 2zM9 13.5c0 .3.1.5.2.7.2.2.5.3.8.3.3 0 .6-.1.8-.3.2-.2.3-.4.3-.7v-.5c0-.3-.1-.5-.3-.7-.2-.2-.5-.3-.8-.3-.3 0-.6.1-.8.3-.2.2-.3.4-.3.7v.5z"/>
          </svg>
          <span className={`ml-2 text-xl font-bold transition-colors duration-300
            ${theme === 'dark-theme' ? 'text-gray-100' : 'text-gray-900'}`}>
            AI Agri-Advisor
          </span>
        </Link>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-wrap justify-center sm:justify-start space-x-4 mt-4 sm:mt-0">
        <Link to="/yield" className="link-hover-effect">Yield</Link>
        <Link to="/disease" className="link-hover-effect">Disease</Link>
        <Link to="/fertilizer" className="link-hover-effect">Fertilizer</Link>
        <Link to="/insights" className="link-hover-effect">Insights</Link>
        <Link to="/chat" className="link-hover-effect">Chat</Link>
      </nav>

      {/* Theme toggle container */}
      <div className="mt-4 sm:mt-0">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
