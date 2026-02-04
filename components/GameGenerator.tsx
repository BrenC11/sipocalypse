
import React, { useState, useCallback, useEffect } from 'react';
import { GameOptions, GeneratedGame } from '../types';
import { CHAOS_LEVELS, MIN_RULES, MAX_RULES, DEFAULT_RULES, FUNNY_ACTIVITY_EXAMPLES, SOCIAL_LINKS } from '../constants'; 
import { generateGameViaWebhook } from '../services/gameService'; // Updated import path and function name
import GameDisplay from './GameDisplay';
import Button from './Button';
import SelectInput from './SelectInput';
import CheckboxInput from './CheckboxInput';
import TextInput from './TextInput';
import SliderInput from './SliderInput';

const COCKTAIL_WEBHOOK_URL = 'https://hook.eu2.make.com/tre1fp9e0ayyugq3x18phpky3k51eonm';

const GameGenerator: React.FC = () => {
  const [options, setOptions] = useState<GameOptions>({
    activity: '',
    chaosLevel: CHAOS_LEVELS[0], 
    includeDares: false,
    numberOfRules: DEFAULT_RULES,
  });
  const [generatedGame, setGeneratedGame] = useState<GeneratedGame | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [randomPlaceholder, setRandomPlaceholder] = useState<string>('');
  const [showMascot, setShowMascot] = useState<boolean>(false);


  // State for cocktail recipe request
  const [cocktailEmail, setCocktailEmail] = useState<string>('');
  const [cocktailSubmissionStatus, setCocktailSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [cocktailSubmissionError, setCocktailSubmissionError] = useState<string | null>(null);

  const instagramLink = SOCIAL_LINKS.find(link => link.name === 'Instagram')?.href || 'https://www.instagram.com/sipocalypse.fun';

  useEffect(() => {
    // Set a random placeholder when the component mounts
    if (FUNNY_ACTIVITY_EXAMPLES && FUNNY_ACTIVITY_EXAMPLES.length > 0) {
      const randomIndex = Math.floor(Math.random() * FUNNY_ACTIVITY_EXAMPLES.length);
      setRandomPlaceholder(FUNNY_ACTIVITY_EXAMPLES[randomIndex]);
    } else {
      setRandomPlaceholder("e.g., At a funeral, In the gym..."); // Fallback
    }
  }, []);

  useEffect(() => {
    setShowMascot(options.activity.trim().length > 0);
  }, [options.activity]);


  const resetCocktailForm = useCallback(() => {
    setCocktailEmail('');
    setCocktailSubmissionStatus('idle');
    setCocktailSubmissionError(null);
  }, []);

  const handleInputChange = useCallback(<K extends keyof GameOptions>(field: K, value: GameOptions[K]) => {
    setOptions(prev => ({ 
      ...prev, 
      [field]: field === 'numberOfRules' ? Number(value) : value 
    }));
    if (generatedGame) { // If a game was displayed, clear it and reset cocktail form
        setGeneratedGame(null); 
        resetCocktailForm();
    }
    setError(null);
  }, [generatedGame, resetCocktailForm]);

  const handleGenerateGame = useCallback(async () => {
    if (!options.activity.trim()) {
      setError("Please tell us what you're doing!");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedGame(null); // Clear previous game
    resetCocktailForm(); // Reset cocktail form for new game generation
    try {
      const chaosLevelIndex = CHAOS_LEVELS.indexOf(options.chaosLevel);
      const chaosLevelNumeric = chaosLevelIndex !== -1 ? chaosLevelIndex + 1 : 1;

      console.log("GameGenerator Debug: Original ChaosLevel String:", options.chaosLevel);
      console.log("GameGenerator Debug: Calculated Index:", chaosLevelIndex);
      console.log("GameGenerator Debug: Calculated Numeric ChaosLevel:", chaosLevelNumeric);

      const paramsForService = {
        activity: options.activity,
        chaosLevel: chaosLevelNumeric,
        includeDares: options.includeDares,
        numberOfRules: options.numberOfRules,
      };
      console.log("GameGenerator Debug: paramsForService (to be sent to service):", paramsForService); // Added log

      const game = await generateGameViaWebhook(paramsForService); // Updated function call
      setGeneratedGame(game);
    } catch (err: any) {
      console.error("Error generating game:", err);
      setError(err.message || 'Failed to generate game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [options, resetCocktailForm]);

  const handleActivityKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && options.activity.trim() && !isLoading) {
      event.preventDefault(); // Prevent any default form submission behavior
      handleGenerateGame();
    }
  };


  const sendCocktailRequestToWebhook = async (activity: string, email: string): Promise<void> => {
    const payload = { activity, email };
    const response = await fetch(COCKTAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        // Try to get error text, but Make.com might not always provide a useful body for non-200s
        let errorDetails = `Webhook request failed with status: ${response.status}`;
        try {
            const errorText = await response.text();
            if (errorText) {
                errorDetails += ` - ${errorText}`;
            }
        } catch (e) {
            // Ignore error from parsing response text
        }
        throw new Error(errorDetails);
    }
     // Make.com usually returns 'Accepted' or similar for successful webhook reception
    console.log('Webhook response:', await response.text()); 
  };

  const handleCocktailEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCocktailEmail(e.target.value);
    // Allow re-typing after error/success without immediately clearing message
    if (cocktailSubmissionStatus === 'error' || cocktailSubmissionStatus === 'success') {
        setCocktailSubmissionStatus('idle'); 
        setCocktailSubmissionError(null);
    }
  };

  const handleCocktailSubmit = async () => {
    if (!cocktailEmail.trim() || !/\S+@\S+\.\S+/.test(cocktailEmail)) {
        setCocktailSubmissionError('Please enter a valid email address.');
        setCocktailSubmissionStatus('error');
        return;
    }
    setCocktailSubmissionStatus('submitting');
    setCocktailSubmissionError(null);
    try {
        await sendCocktailRequestToWebhook(options.activity, cocktailEmail);
        setCocktailSubmissionStatus('success');
        // Do not clear email on success immediately to let user see what they submitted
        // setCocktailEmail(''); 
    } catch (err: any) {
        console.error("Error sending cocktail request:", err);
        setCocktailSubmissionError(err.message || 'Failed to send cocktail recipe request. Please try again.');
        setCocktailSubmissionStatus('error');
    }
  };

  const mascotIsVisible = showMascot && !isLoading && !generatedGame;

  return (
    <div className="relative max-w-3xl mx-auto p-6 md:p-8 bg-gray-900/60 rounded-xl shadow-2xl shadow-purple-500/10">
      <a
        href={instagramLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow Sipocalypse on Instagram"
        className={`
          block absolute w-32 h-32 -top-12 -right-8 md:w-48 md:h-48 md:-top-16 md:-right-24
          transform transition-all duration-500 ease-in-out
          ${mascotIsVisible ? 'scale-100 opacity-100 rotate-[15deg]' : 'scale-0 opacity-0 rotate-0'}
          z-20
        `}
      >
        <img
          src="https://i.imgur.com/0F9BW4r.png"
          alt="Sipocalypse Mascot pointing to Instagram"
          className="w-full h-full"
        />
      </a>
      <h2 className="text-4xl font-luckiest text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
        Game Generator
      </h2>
      
      <div className="space-y-6 mb-8">
        <TextInput
          id="activity"
          label="What are you doing?"
          value={options.activity}
          onChange={(e) => handleInputChange('activity', e.target.value)}
          placeholder={randomPlaceholder || "e.g., At a funeral, In the gym, During a boring meeting"}
          disabled={isLoading}
          onKeyDown={handleActivityKeyDown} // Added onKeyDown handler
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectInput
            id="chaosLevel" 
            label="Chaos Level" 
            value={options.chaosLevel} 
            onChange={(e) => handleInputChange('chaosLevel', e.target.value)} 
            options={CHAOS_LEVELS} 
            disabled={isLoading}
          />
          <SliderInput
            id="numberOfRules"
            label="Number of Rules"
            value={options.numberOfRules}
            onChange={(e) => handleInputChange('numberOfRules', parseInt(e.target.value, 10))}
            min={MIN_RULES}
            max={MAX_RULES}
            disabled={isLoading}
            unitLabel="rules"
          />
        </div>
        <div className="pt-2"> 
            <CheckboxInput
            id="includeDares"
            label="Include Dares?"
            checked={options.includeDares}
            onChange={(e) => handleInputChange('includeDares', e.target.checked)}
            disabled={isLoading}
            />
        </div>
      </div>

      <Button
        onClick={handleGenerateGame}
        disabled={isLoading || !options.activity.trim()}
        isLoading={isLoading}
        variant="primary"
        size="lg" 
        className="w-full text-lg py-3.5 font-semibold"
        title={!options.activity.trim() ? "Please enter what you're doing first" : undefined}
      >
        {isLoading ? 'Summoning Chaos...' : 'Begin the Sipocalypse!'}
      </Button>

      {error && (
        <div className="mt-6 p-4 bg-red-500/20 text-red-400 border border-red-500 rounded-md" role="alert">
          <p className="font-semibold">Oops! Something went wrong.</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {generatedGame && !isLoading && (
        <>
          <div className="mt-10">
            <GameDisplay game={generatedGame} />
          </div>

          {/* Cocktail Recipe Request Section */}
          <div className="mt-10 p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700/80">
            <h4 className="text-xl font-semibold text-center mb-4 text-purple-300">
              Want a custom chaos cocktail recipe designed for your activity?
            </h4>
            <div className="space-y-4">
              <TextInput
                id="cocktailEmail"
                label="Your Email Address"
                type="email"
                value={cocktailEmail}
                onChange={handleCocktailEmailChange}
                placeholder="e.g., partyanimal@example.com"
                disabled={cocktailSubmissionStatus === 'submitting'}
              />
              <Button
                onClick={handleCocktailSubmit}
                disabled={cocktailSubmissionStatus === 'submitting' || !cocktailEmail.trim() || cocktailSubmissionStatus === 'success'}
                isLoading={cocktailSubmissionStatus === 'submitting'}
                variant="secondary"
                className="w-full text-md py-2.5 font-medium"
              >
                {cocktailSubmissionStatus === 'submitting' ? 'Sending Request...' : 
                 cocktailSubmissionStatus === 'success' ? 'Request Sent!' : 'Get My Cocktail Recipe!'}
              </Button>
              <p className="text-xs text-gray-400 mt-3 text-center">
                By entering your email, you agree to receive occasional updates and marketing emails from Sipocalypse. 
                You can unsubscribe at any time. Read our{' '}
                <a href="/#/privacy" className="text-purple-300 hover:text-purple-200 underline">
                  Privacy Policy
                </a>.
              </p>
              {cocktailSubmissionStatus === 'success' && (
                <p className="text-green-400 text-sm text-center animate-pulse mt-2">
                  Request sent! Keep an eye on your inbox (and maybe your spam folder, just in case!).
                </p>
              )}
              {cocktailSubmissionStatus === 'error' && cocktailSubmissionError && (
                <p className="text-red-400 text-sm text-center mt-2" role="alert">
                  {cocktailSubmissionError}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GameGenerator;
