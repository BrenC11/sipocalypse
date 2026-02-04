
import React from 'react';
import { SOCIAL_LINKS } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-end items-center"> {/* Changed justify-between to justify-end */}
        {/* Logo/Title removed */}
        <nav className="flex items-center space-x-4">
          <a href="#/admin" className="text-xs md:text-sm text-white/80 hover:text-custom-lime transition-colors duration-300">
            Admin
          </a>
          <a href="#/privacy" className="text-xs md:text-sm text-white/80 hover:text-custom-lime transition-colors duration-300">
            Privacy
          </a>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.name}
              className="text-custom-pink hover:text-custom-lime transition-colors duration-300" // Updated colors
            >
              {link.icon}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
