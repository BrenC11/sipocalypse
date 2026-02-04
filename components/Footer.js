
import React from 'react';
import { SOCIAL_LINKS, APP_TITLE_PART1, APP_TITLE_PART2 } from '../constants.js';

const Footer = () => {
  return (
    React.createElement("footer", { className: "relative z-20 bg-gray-900/80 backdrop-blur-md border-t-2 border-custom-pink" },
      React.createElement("div", { className: "container mx-auto px-4 py-8 text-center text-gray-300" },
        React.createElement("div", { className: "flex justify-center space-x-6 mb-4" },
          SOCIAL_LINKS.map((link) => (
            React.createElement("a", {
              key: link.name,
              href: link.href,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": link.name,
              className: "text-custom-pink hover:text-custom-lime transition-colors duration-300"
            },
            link.icon
            )
          ))
        ),
        React.createElement("p", { className: "text-sm opacity-90" },
          `© ${new Date().getFullYear()} ${APP_TITLE_PART1}${APP_TITLE_PART2}. All Rights Reserved.`
        ),
        React.createElement("p", { className: "text-xs mt-2 opacity-70" },
          "Drink responsibly (or don't, it's the Sipocalypse)."
        )
      )
    )
  );
};

export default Footer;