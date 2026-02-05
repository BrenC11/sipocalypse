
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import GameGenerator from './components/GameGenerator';
import PrivacyPolicyPage from './components/PrivacyPolicyPage'; // New import
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [route, setRoute] = useState(() =>
    typeof window !== 'undefined' ? window.location.hash : ''
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

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
  } else if (route === '#/admin') {
    pageContent = <AdminDashboard />;
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
        <section id="faq" className="py-12 md:py-16 bg-transparent">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-luckiest text-custom-pink text-center mb-8">
              Sipocalypse FAQ
            </h2>
            <div className="mx-auto max-w-3xl space-y-4 text-left">
              <details className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <summary className="cursor-pointer text-lg md:text-xl font-semibold text-white">
                  What is Sipocalypse?
                </summary>
                <p className="mt-3 text-white/90">
                  Sipocalypse is a drinking game rule and dare generator that creates playful, chaos-calibrated challenges for any activity.
                </p>
              </details>
              <details className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <summary className="cursor-pointer text-lg md:text-xl font-semibold text-white">
                  How do the rules work?
                </summary>
                <p className="mt-3 text-white/90">
                  Pick an activity and settings, then Sipocalypse generates rules and dares you can use immediately for your group.
                </p>
              </details>
              <details className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <summary className="cursor-pointer text-lg md:text-xl font-semibold text-white">
                  Is Sipocalypse free to use?
                </summary>
                <p className="mt-3 text-white/90">
                  Yes. Sipocalypse is free, with optional support if you want to buy the team a drink.
                </p>
              </details>
              <details className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <summary className="cursor-pointer text-lg md:text-xl font-semibold text-white">
                  Is Sipocalypse for adults only?
                </summary>
                <p className="mt-3 text-white/90">
                  Sipocalypse is intended for adults of legal drinking age. Please drink responsibly and follow local laws.
                </p>
              </details>
            </div>
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
          src="/background-1280.jpeg"
          srcSet="/background-1280.jpeg 1280w, /background-1920.jpeg 1920w"
          sizes="100vw"
          alt="Abstract party background"
          className="w-full h-full object-cover opacity-90"
          loading="eager"
          fetchPriority="high"
          decoding="async"
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
