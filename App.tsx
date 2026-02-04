
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import GameGenerator from './components/GameGenerator';
import PrivacyPolicyPage from './components/PrivacyPolicyPage'; // New import

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
      window.scrollTo(0, 0); // Scroll to top on route change
    };

    // Set initial route based on hash
    setRoute(window.location.hash);

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  let pageContent;
  let showHero = false;

  if (route === '#/privacy') {
    pageContent = <PrivacyPolicyPage />;
  } else {
    // Default to main page if hash is empty, '#', or anything else
    showHero = true;
    pageContent = (
      <>
        <section id="generator" className="relative z-10 py-12 md:py-20 bg-transparent">
          <div className="container mx-auto px-4">
            <GameGenerator />
          </div>
        </section>
        <section className="py-8 md:py-12 bg-transparent text-center">
          <div className="container mx-auto px-4">
            <a
              href="https://www.buymeacoffee.com/sipocalypse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 text-lg bg-custom-lime hover:bg-lime-400 text-custom-pink font-comic shadow-md hover:shadow-lg focus:ring-custom-pink focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 ease-in-out rounded-lg"
              aria-label="Support us by buying a drink on Buy Me A Coffee"
            >
              <span role="img" aria-label="Coffee cup" className="mr-2 text-xl">☕</span>
              Buy me a Drink
            </a>
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="bg-transparent text-gray-100 min-h-screen flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Global Background Layer */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://i.imgur.com/5EqDvlN.jpeg"
          alt="Abstract party background"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <Header /> {/* Header is sticky and has z-50 */}
      {showHero && <Hero />} {/* Hero content will be on top of the global background */}
      <main className="flex-grow relative z-10"> {/* Ensure main content is layered correctly above background */}
        {pageContent}
      </main>
      <Footer />
    </div>
  );
};

export default App;