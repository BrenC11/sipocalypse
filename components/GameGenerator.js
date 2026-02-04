
import React from 'react'; // Changed from: import React, { useState, useCallback, useEffect } from 'react';
// import { GameOptions, GeneratedGame } from '../types.js'; // Types are erased
import { CHAOS_LEVELS, MIN_RULES, MAX_RULES, DEFAULT_RULES, FUNNY_ACTIVITY_EXAMPLES, SOCIAL_LINKS } from '../constants.js';
import { generateGameViaWebhook } from '../services/gameService.js'; // Updated import path and function name
import GameDisplay from './GameDisplay.js';
import Button from './Button.js';
import SelectInput from './SelectInput.js';
import CheckboxInput from './CheckboxInput.js';
import TextInput from './TextInput.js';
import SliderInput from './SliderInput.js';

const COCKTAIL_API_URL = '/api/send-cocktail';

const GameGenerator = () => {
  const [options, setOptions] = React.useState({ // Changed to React.useState
    activity: '',
    chaosLevel: CHAOS_LEVELS[0],
    includeDares: false,
    numberOfRules: DEFAULT_RULES,
  });
  const [generatedGame, setGeneratedGame] = React.useState(null); // Changed to React.useState
  const [isLoading, setIsLoading] = React.useState(false); // Changed to React.useState
  const [error, setError] = React.useState(null); // Changed to React.useState
  const [randomPlaceholder, setRandomPlaceholder] = React.useState(''); // Changed to React.useState
  const [showMascot, setShowMascot] = React.useState(false);


  // State for cocktail recipe request
  const [cocktailEmail, setCocktailEmail] = React.useState(''); // Changed to React.useState
  const [cocktailSubmissionStatus, setCocktailSubmissionStatus] = React.useState('idle'); // Changed to React.useState
  const [cocktailSubmissionError, setCocktailSubmissionError] = React.useState(null); // Changed to React.useState

  const instagramLink = SOCIAL_LINKS.find(link => link.name === 'Instagram')?.href || 'https://www.instagram.com/sipocalypse.fun';

  React.useEffect(() => { // Changed to React.useEffect
    // Set a random placeholder when the component mounts
    if (FUNNY_ACTIVITY_EXAMPLES && FUNNY_ACTIVITY_EXAMPLES.length > 0) {
      const randomIndex = Math.floor(Math.random() * FUNNY_ACTIVITY_EXAMPLES.length);
      setRandomPlaceholder(FUNNY_ACTIVITY_EXAMPLES[randomIndex]);
    } else {
      setRandomPlaceholder("e.g., At a funeral, In the gym..."); // Fallback if array is empty
    }
  }, []); // Empty dependency array means this runs once on mount

  React.useEffect(() => {
    setShowMascot(options.activity.trim().length > 0);
  }, [options.activity]);


  const resetCocktailForm = React.useCallback(() => { // Changed to React.useCallback
    setCocktailEmail('');
    setCocktailSubmissionStatus('idle');
    setCocktailSubmissionError(null);
  }, []); // Dependencies for useCallback

  const handleInputChange = React.useCallback((field, value) => { // Changed to React.useCallback
    setOptions(prev => ({
      ...prev,
      [field]: field === 'numberOfRules' ? Number(value) : value
    }));
    if (generatedGame) {
        setGeneratedGame(null);
        resetCocktailForm();
    }
    setError(null);
  }, [generatedGame, resetCocktailForm]); // Dependencies for useCallback

  const handleGenerateGame = React.useCallback(async () => { // Changed to React.useCallback
    if (!options.activity.trim()) {
      setError("Please tell us what you're doing!");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedGame(null);
    resetCocktailForm();
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
    } catch (err) {
      console.error("Error generating game:", err);
      setError(err.message || 'Failed to generate game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [options, resetCocktailForm]); // Dependencies for useCallback

  const handleActivityKeyDown = (event) => {
    if (event.key === 'Enter' && options.activity.trim() && !isLoading) {
      event.preventDefault();
      handleGenerateGame();
    }
  };

  const sendCocktailEmailRequest = async (activity, email) => {
    const requestBody = { activity, email };
    const response = await fetch(COCKTAIL_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        const errorDetails = typeof errorPayload?.error === 'string'
          ? errorPayload.error
          : `Request failed with status ${response.status}`;
        throw new Error(errorDetails);
    }
    const responsePayload = await response.json().catch(() => null);
    if (responsePayload?.sheet?.attempted && !responsePayload?.sheet?.success) {
      console.warn('Google Sheet logging failed:', responsePayload?.sheet?.error || 'Unknown sheet error');
    }
  };

  const handleCocktailEmailChange = (e) => {
    setCocktailEmail(e.target.value);
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
        await sendCocktailEmailRequest(options.activity, cocktailEmail);
        setCocktailSubmissionStatus('success');
    } catch (err) {
        console.error("Error sending cocktail request:", err);
        setCocktailSubmissionError(err.message || 'Failed to send cocktail recipe request. Please try again.');
        setCocktailSubmissionStatus('error');
    }
  };

  const mascotIsVisible = showMascot && !isLoading && !generatedGame;

  return (
    React.createElement("div", { className: "relative max-w-3xl mx-auto p-6 md:p-8 bg-gray-900/60 rounded-xl shadow-2xl shadow-purple-500/10" },
      React.createElement("a", {
        href: instagramLink,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": "Follow Sipocalypse on Instagram",
        className: `
          block absolute w-32 h-32 -top-12 -right-8 md:w-48 md:h-48 md:-top-16 md:-right-24
          transform transition-all duration-500 ease-in-out
          ${mascotIsVisible ? 'scale-100 opacity-100 rotate-[15deg]' : 'scale-0 opacity-0 rotate-0'}
          z-20
        `
      },
        React.createElement("img", {
          src: "/mascot-socials-512.png",
          alt: "Sipocalypse Mascot pointing to Instagram",
          className: "w-full h-full",
          loading: "lazy",
          decoding: "async"
        })
      ),
      React.createElement("h2", { className: "text-4xl font-luckiest text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text" },
        "Game Generator"
      ),
      React.createElement("div", { className: "space-y-6 mb-8" },
        React.createElement(TextInput, {
          id: "activity",
          label: "What are you doing?",
          value: options.activity,
          onChange: (e) => handleInputChange('activity', e.target.value),
          placeholder: randomPlaceholder || "e.g., At a funeral, In the gym, During a boring meeting",
          disabled: isLoading,
          onKeyDown: handleActivityKeyDown
        }),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
          React.createElement(SelectInput, {
            id: "chaosLevel",
            label: "Chaos Level",
            value: options.chaosLevel,
            onChange: (e) => handleInputChange('chaosLevel', e.target.value),
            options: CHAOS_LEVELS,
            disabled: isLoading
          }),
          React.createElement(SliderInput, {
            id: "numberOfRules",
            label: "Number of Rules",
            value: options.numberOfRules,
            onChange: (e) => handleInputChange('numberOfRules', parseInt(e.target.value, 10)),
            min: MIN_RULES,
            max: MAX_RULES,
            disabled: isLoading,
            unitLabel: "rules"
          })
        ),
        React.createElement("div", { className: "pt-2" },
            React.createElement(CheckboxInput, {
            id: "includeDares",
            label: "Include Dares?",
            checked: options.includeDares,
            onChange: (e) => handleInputChange('includeDares', e.target.checked),
            disabled: isLoading
            })
        )
      ),
      React.createElement(Button, {
        onClick: handleGenerateGame,
        disabled: isLoading || !options.activity.trim(),
        isLoading: isLoading,
        variant: "primary",
        size: "lg",
        className: "w-full text-lg py-3.5 font-semibold",
        title: !options.activity.trim() ? "Please enter what you're doing first" : undefined
      },
      isLoading ? 'Summoning Chaos...' : 'Begin the Sipocalypse!'
      ),
      error && (
        React.createElement("div", { className: "mt-6 p-4 bg-red-500/20 text-red-400 border border-red-500 rounded-md", role: "alert" },
          React.createElement("p", { className: "font-semibold" }, "Oops! Something went wrong."),
          React.createElement("p", { className: "text-sm" }, error)
        )
      ),
      generatedGame && !isLoading && (
        React.createElement(React.Fragment, null,
          React.createElement("div", { className: "mt-10" },
            React.createElement(GameDisplay, { game: generatedGame })
          ),
          React.createElement("div", { className: "mt-10 p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700/80" },
            React.createElement("h4", { className: "text-xl font-semibold text-center mb-4 text-purple-300" },
              "Want a custom chaos cocktail recipe designed for your activity?"
            ),
            React.createElement("div", { className: "space-y-4" },
              React.createElement(TextInput, {
                id: "cocktailEmail",
                label: "Your Email Address",
                type: "email",
                value: cocktailEmail,
                onChange: handleCocktailEmailChange,
                placeholder: "e.g., partyanimal@example.com",
                disabled: cocktailSubmissionStatus === 'submitting'
              }),
              React.createElement(Button, {
                onClick: handleCocktailSubmit,
                disabled: cocktailSubmissionStatus === 'submitting' || !cocktailEmail.trim() || cocktailSubmissionStatus === 'success',
                isLoading: cocktailSubmissionStatus === 'submitting',
                variant: "secondary",
                className: "w-full text-md py-2.5 font-medium"
              },
              cocktailSubmissionStatus === 'submitting' ? 'Sending Request...' :
              cocktailSubmissionStatus === 'success' ? 'Request Sent!' : 'Get My Cocktail Recipe!'
              ),
              React.createElement("p", {className: "text-xs text-gray-400 mt-3 text-center"},
                "By entering your email, you agree to receive occasional updates and marketing emails from Sipocalypse. You can unsubscribe at any time. Read our ",
                React.createElement("a", {href: "/#/privacy", className: "text-purple-300 hover:text-purple-200 underline"}, "Privacy Policy"),
                "."
              ),
              cocktailSubmissionStatus === 'success' && (
                React.createElement("p", { className: "text-green-400 text-sm text-center animate-pulse mt-2" },
                  "Request sent! Keep an eye on your inbox (and maybe your spam folder, just in case!)."
                )
              ),
              cocktailSubmissionStatus === 'error' && cocktailSubmissionError && (
                React.createElement("p", { className: "text-red-400 text-sm text-center mt-2", role: "alert" },
                  cocktailSubmissionError
                )
              )
            )
          )
        )
      )
    )
  );
};

export default GameGenerator;
