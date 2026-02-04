import React from 'react';
import Button from './Button.js';

const Hero = () => {
  const scrollToGenerator = () => {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    React.createElement("div", { className: "relative h-[calc(100vh-56px)] min-h-[500px] md:min-h-[600px] flex items-center justify-center text-center px-4 overflow-hidden" },
      React.createElement("div", { className: "relative z-10 flex flex-col items-center" },
        React.createElement("img", {
          src: "/sipocalypse-logo.png",
          alt: "Sipocalypse Logo",
          className: "max-w-lg w-full h-auto mb-8 md:mb-10 mx-auto animate-pulsate",
          loading: "eager",
          fetchPriority: "high",
          decoding: "async"
        }),
        React.createElement("p", { className: "font-luckiest text-custom-purple text-3xl md:text-4xl max-w-3xl mx-auto mb-10" },
          "Every activity is now a drinking game. You’re welcome."
        ),
        React.createElement(Button, {
          onClick: scrollToGenerator,
          variant: "primary",
          size: "lg",
          className: "font-semibold text-lg px-10 py-4"
        },
        "GENERATE MY GAME!"
        )
      ),
      React.createElement("div", { className: "absolute bottom-4 left-0 right-0 flex justify-center animate-bounce" },
        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-custom-pink" },
          React.createElement("path", { d: "M12 5v14" }),
          React.createElement("path", { d: "m19 12-7 7-7-7" })
        )
      )
    )
  );
};

export default Hero;
