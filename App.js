
import React from 'react'; // Keep React import
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Hero from './components/Hero.js';
import GameGenerator from './components/GameGenerator.js';
import PrivacyPolicyPage from './components/PrivacyPolicyPage.js';

const App = () => {
  const [route, setRoute] = React.useState(window.location.hash); // Changed to React.useState

  React.useEffect(() => { // Changed to React.useEffect
    const handleHashChange = () => {
      setRoute(window.location.hash);
      window.scrollTo(0, 0); // Scroll to top on route change
    };

    // Set initial route based on hash
    setRoute(window.location.hash); // This is fine

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []); // Empty dependency array is fine

  let pageContent;
  let showHero = false;

  if (route === '#/privacy') {
    pageContent = React.createElement(PrivacyPolicyPage, null);
  } else {
    // Default to main page if hash is empty, '#', or anything else
    showHero = true;
    pageContent = React.createElement(React.Fragment, null,
      React.createElement("section", { id: "generator", className: "relative z-10 py-12 md:py-20 bg-transparent" },
        React.createElement("div", { className: "container mx-auto px-4" },
          React.createElement(GameGenerator, null)
        )
      ),
      React.createElement("section", { className: "py-8 md:py-12 bg-transparent text-center" },
        React.createElement("div", { className: "container mx-auto px-4" },
          React.createElement("a", {
            href: "https://www.buymeacoffee.com/sipocalypse",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-flex items-center justify-center px-8 py-3 text-lg bg-custom-lime hover:bg-lime-400 text-custom-pink font-comic shadow-md hover:shadow-lg focus:ring-custom-pink focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 ease-in-out rounded-lg",
            "aria-label": "Support us by buying a drink on Buy Me A Coffee"
          },
          React.createElement("span", { role: "img", "aria-label": "Coffee cup", className: "mr-2 text-xl" }, "\u2615"),
          "Buy me a Drink"
          )
        )
      )
    );
  }

  return (
    React.createElement("div", { className: "bg-transparent text-gray-100 min-h-screen flex flex-col selection:bg-purple-500 selection:text-white" },
      React.createElement("div", { className: "fixed inset-0 z-0" },
        React.createElement("img", {
          src: "https://i.imgur.com/5EqDvlN.jpeg",
          alt: "Abstract party background",
          className: "w-full h-full object-cover opacity-90"
        }),
        React.createElement("div", { className: "absolute inset-0 bg-black/10" })
      ),
      React.createElement(Header, null),
      showHero && React.createElement(Hero, null),
      React.createElement("main", { className: "flex-grow relative z-10" },
        pageContent
      ),
      React.createElement(Footer, null)
    )
  );
};

export default App;
