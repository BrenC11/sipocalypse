
import React from 'react'; // Keep React import
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Hero from './components/Hero.js';
import GameGenerator from './components/GameGenerator.js';
import PrivacyPolicyPage from './components/PrivacyPolicyPage.js';
import AdminDashboard from './components/AdminDashboard.tsx';
import AdminResults from './components/AdminResults.tsx';
import AdminWinnerDetail from './components/AdminWinnerDetail.tsx';

const App = () => {
  const [route, setRoute] = React.useState(() =>
    typeof window !== 'undefined' ? window.location.hash : ''
  ); // Changed to React.useState

  React.useEffect(() => { // Changed to React.useEffect
    if (typeof window === 'undefined') return;

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
  } else if (route === '#/admin') {
    pageContent = React.createElement(AdminDashboard, null);
  } else if (route.startsWith('#/admin/results')) {
    pageContent = React.createElement(AdminResults, null);
  } else if (route.startsWith('#/admin/winner')) {
    pageContent = React.createElement(AdminWinnerDetail, null);
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
      ),
      React.createElement("section", { id: "faq", className: "py-12 md:py-16 bg-transparent" },
        React.createElement("div", { className: "container mx-auto px-4" },
          React.createElement("h2", { className: "text-3xl md:text-4xl font-luckiest text-custom-pink text-center mb-8" }, "Sipocalypse FAQ"),
          React.createElement("div", { className: "mx-auto max-w-3xl space-y-4 text-left" },
            React.createElement("details", { className: "rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur" },
              React.createElement("summary", { className: "cursor-pointer text-lg md:text-xl font-semibold text-white" }, "What is Sipocalypse?"),
              React.createElement("p", { className: "mt-3 text-white/90" }, "Sipocalypse is a drinking game rule and dare generator that creates playful, chaos-calibrated challenges for any activity.")
            ),
            React.createElement("details", { className: "rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur" },
              React.createElement("summary", { className: "cursor-pointer text-lg md:text-xl font-semibold text-white" }, "How do the rules work?"),
              React.createElement("p", { className: "mt-3 text-white/90" }, "Pick an activity and settings, then Sipocalypse generates rules and dares you can use immediately for your group.")
            ),
            React.createElement("details", { className: "rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur" },
              React.createElement("summary", { className: "cursor-pointer text-lg md:text-xl font-semibold text-white" }, "Is Sipocalypse free to use?"),
              React.createElement("p", { className: "mt-3 text-white/90" }, "Yes. Sipocalypse is free, with optional support if you want to buy the team a drink.")
            ),
            React.createElement("details", { className: "rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur" },
              React.createElement("summary", { className: "cursor-pointer text-lg md:text-xl font-semibold text-white" }, "Is Sipocalypse for adults only?"),
              React.createElement("p", { className: "mt-3 text-white/90" }, "Sipocalypse is intended for adults of legal drinking age. Please drink responsibly and follow local laws.")
            )
          )
        )
      )
    );
  }

  return (
    React.createElement("div", { className: "bg-transparent text-gray-100 min-h-screen flex flex-col selection:bg-purple-500 selection:text-white" },
      React.createElement("div", { className: "fixed inset-0 z-0" },
        React.createElement("img", {
          src: "/background-1280.jpeg",
          srcSet: "/background-1280.jpeg 1280w, /background-1920.jpeg 1920w",
          sizes: "100vw",
          alt: "Abstract party background",
          className: "w-full h-full object-cover opacity-90",
          loading: "eager",
          fetchPriority: "high",
          decoding: "async"
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
