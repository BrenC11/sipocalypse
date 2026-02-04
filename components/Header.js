
import React from 'react';
import { SOCIAL_LINKS } from '../constants.js'; // Points to the eventual .js file

const Header = () => {
  return (
    React.createElement(
      "header",
      { className: "bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-lg" },
      React.createElement(
        "div",
        { className: "container mx-auto px-4 py-4 flex justify-end items-center" },
        React.createElement(
          "nav",
          { className: "flex items-center space-x-4" },
          React.createElement(
            "a",
            {
              href: "#/admin",
              className: "text-xs md:text-sm text-white/80 hover:text-custom-lime transition-colors duration-300"
            },
            "Admin"
          ),
          React.createElement(
            "a",
            {
              href: "#/privacy",
              className: "text-xs md:text-sm text-white/80 hover:text-custom-lime transition-colors duration-300"
            },
            "Privacy"
          ),
          SOCIAL_LINKS.map((link) => (
            React.createElement(
              "a",
              {
                key: link.name,
                href: link.href,
                target: "_blank",
                rel: "noopener noreferrer",
                "aria-label": link.name,
                className: "text-custom-pink hover:text-custom-lime transition-colors duration-300"
              },
              link.icon // This assumes link.icon is a valid React element (which it will be once constants.js is transpiled)
            )
          ))
        )
      )
    )
  );
};

export default Header;
