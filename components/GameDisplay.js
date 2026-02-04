
import React from 'react'; // Keep React import
// import { GeneratedGame } from '../types.js'; // Types are erased
import Button from './Button.js';

const ShareIcon = ({className}) => (
  React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: className },
    React.createElement("path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }),
    React.createElement("polyline", { points: "16 6 12 2 8 6" }),
    React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "15" })
  )
);

const GameDisplay = ({ game }) => {
  const [copied, setCopied] = React.useState(false); // Changed to React.useState
  const [shared, setShared] = React.useState(false); // Changed to React.useState

  const formatGameForShareOrCopy = React.useCallback(() => { // Changed to React.useCallback
    let text = `🎲 Sipocalypse Game: ${game.title} 🎲\n\n`;
    text += "📜 Rules:\n";
    game.rules.forEach((rule, index) => {
      text += `${index + 1}. ${rule}\n`;
    });
    // Dares are only added to the copied/shared text if they exist and are populated
    if (game.dares && game.dares.length > 0) {
      text += "\n🔥 Dares:\n";
      game.dares.forEach((dare, index) => {
        text += `${index + 1}. ${dare}\n`;
      });
    }
    text += "\nPlay responsibly! Find more games at www.sipocalypse.fun";
    return text;
  }, [game]); // Dependency for useCallback

  const handleCopy = React.useCallback(async () => { // Changed to React.useCallback
    const gameText = formatGameForShareOrCopy();
    try {
      await navigator.clipboard.writeText(gameText);
      setCopied(true);
      setShared(false); 
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy rules. Please try selecting and copying manually.');
    }
  }, [formatGameForShareOrCopy]); // Dependency for useCallback

  const handleShare = React.useCallback(async () => { // Changed to React.useCallback
    const gameText = formatGameForShareOrCopy();
    const shareData = {
      title: `Sipocalypse Game: ${game.title}`,
      text: gameText,
      url: window.location.href, 
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShared(true);
        setCopied(false); 
        setTimeout(() => setShared(false), 2500);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share API failed, falling back to copy:', err);
          await handleCopy();
        } else {
          console.log('Share action cancelled by user.');
        }
      }
    } else {
      console.log('Web Share API not supported, falling back to copy.');
      await handleCopy();
    }
  }, [game.title, formatGameForShareOrCopy, handleCopy]); // Dependencies for useCallback

  const getShareButtonText = () => {
    if (shared) return 'Shared!';
    if (copied) return 'Copied!';
    if (navigator.share) return 'Share Game';
    return 'Share (Copy)';
  };

  return (
    React.createElement("div", { className: "p-6 bg-gray-700/80 rounded-lg shadow-lg border-4 border-custom-pink" },
      React.createElement("h3", { className: "text-3xl font-luckiest text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400" },
        game.title
      ),
      React.createElement("div", { className: "mb-6" },
        React.createElement("h4", { className: "text-xl font-semibold mb-3 text-purple-300" }, "Game Rules:"),
        React.createElement("ol", { className: "rules-list list-decimal list-inside space-y-2 text-gray-200 pl-4" },
          game.rules.map((rule, index) => (
            React.createElement("li", { key: index, className: "leading-relaxed" }, rule)
          ))
        )
      ),
      /* 
        Conditional rendering for the Dares section.
        This section (including the "Dares:" heading and the list) will only be displayed 
        if `game.dares` is an array and has one or more items. 
        The `gameService` ensures `game.dares` is an empty array if the 'Include Dares' 
        checkbox was unchecked by the user.
      */
      game.dares && game.dares.length > 0 && (
        React.createElement("div", { className: "mb-8" },
          React.createElement("h4", { className: "text-xl font-semibold mb-3 text-pink-300" }, "Dares:"),
          React.createElement("ol", { className: "dares-list list-decimal list-inside space-y-2 text-gray-200 pl-4" },
            game.dares.map((dare, index) => (
              React.createElement("li", { key: index, className: "leading-relaxed" }, dare)
            ))
          )
        )
      ),
      React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
        React.createElement(Button, { onClick: handleCopy, variant: "secondary", className: "w-full font-medium" },
          copied ? 'Copied to Clipboard!' : 'Copy Game'
        ),
        React.createElement(Button, { onClick: handleShare, variant: "secondary", className: "w-full font-medium flex items-center justify-center" },
           React.createElement(ShareIcon, { className: "mr-2" }), " ", getShareButtonText()
        )
      )
    )
  );
};

export default GameDisplay;
