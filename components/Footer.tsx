
import React from 'react';
import { SOCIAL_LINKS, APP_TITLE_PART1, APP_TITLE_PART2 } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-20 bg-gray-900/80 backdrop-blur-md border-t-2 border-custom-pink"> {/* Updated className */}
      <div className="container mx-auto px-4 py-8 text-center text-gray-300"> {/* Updated default text color to match JS version more closely */}
        <div className="flex justify-center space-x-6 mb-4">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.name}
              className="text-custom-pink hover:text-custom-lime transition-colors duration-300"
            >
              {link.icon}
            </a>
          ))}
        </div>
        <p className="text-sm opacity-90"> 
          &copy; {new Date().getFullYear()} {APP_TITLE_PART1}{APP_TITLE_PART2}. All Rights Reserved.
        </p>
        <p className="text-xs mt-2 opacity-70"> 
          Drink responsibly (or don't, it's the Sipocalypse).
        </p>
      </div>
    </footer>
  );
};

export default Footer;
