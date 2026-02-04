
import React, { useState, useCallback } from 'react';
import { GeneratedGame } from '../types';
import Button from './Button';

interface GameDisplayProps {
  game: GeneratedGame;
}

const ShareIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
    <polyline points="16 6 12 2 8 6"></polyline>
    <line x1="12" y1="2" x2="12" y2="15"></line>
  </svg>
);


const GameDisplay: React.FC<GameDisplayProps> = ({ game }) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const formatGameForShareOrCopy = useCallback(() => {
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
    text += "\nPlay responsibly! Find more games at www.sipocalypse.fun"; // Ensure this matches your actual domain if it's live
    return text;
  }, [game]);

  const handleCopy = useCallback(async () => {
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
  }, [formatGameForShareOrCopy]);

  const handleShare = useCallback(async () => {
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
        if ((err as DOMException).name !== 'AbortError') { // User didn't cancel share
          console.error('Share API failed, falling back to copy:', err);
          await handleCopy(); // Fallback to copy if share fails for other reasons
        } else {
          // User cancelled the share dialog, do nothing further.
          console.log('Share action cancelled by user.');
        }
      }
    } else {
      // Fallback to copy if Web Share API is not supported
      console.log('Web Share API not supported, falling back to copy.');
      await handleCopy();
    }
  }, [game.title, formatGameForShareOrCopy, handleCopy]);

  const getShareButtonText = () => {
    if (shared) return 'Shared!';
    if (copied) return 'Copied!'; // If share fell back to copy, 'copied' will be true.
    if (navigator.share) return 'Share Game';
    return 'Share (Copy)'; // Only show this if navigator.share is initially false
  };

  return (
    <div className="p-6 bg-gray-700/80 rounded-lg shadow-lg border-4 border-custom-pink">
      <h3 className="text-3xl font-luckiest text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">
        {game.title}
      </h3>
      
      <div className="mb-6">
        <h4 className="text-xl font-semibold mb-3 text-purple-300">Game Rules:</h4>
        <ol className="rules-list list-decimal list-inside space-y-2 text-gray-200 pl-4">
          {game.rules.map((rule, index) => (
            <li key={index} className="leading-relaxed">{rule}</li>
          ))}
        </ol>
      </div>

      {/* 
        Conditional rendering for the Dares section.
        This section (including the "Dares:" heading and the list) will only be displayed 
        if `game.dares` is an array and has one or more items. 
        The `gameService` ensures `game.dares` is an empty array if the 'Include Dares' 
        checkbox was unchecked by the user.
      */}
      {game.dares && game.dares.length > 0 && (
        <div className="mb-8">
          <h4 className="text-xl font-semibold mb-3 text-pink-300">Dares:</h4>
          <ol className="dares-list list-decimal list-inside space-y-2 text-gray-200 pl-4">
            {game.dares.map((dare, index) => (
              <li key={index} className="leading-relaxed">{dare}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button onClick={handleCopy} variant="secondary" className="w-full font-medium">
          {copied ? 'Copied to Clipboard!' : 'Copy Game'}
        </Button>
        <Button onClick={handleShare} variant="secondary" className="w-full font-medium flex items-center justify-center">
           <ShareIcon className="mr-2" /> {getShareButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default GameDisplay;
