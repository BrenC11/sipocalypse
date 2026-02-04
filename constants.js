
import React from 'react';
// import { SocialLink } from './types.js'; // Types are erased in JS

export const CHAOS_LEVELS = [
  "Initial Sips",
  "Rising Revelry",
  "Pre-Apocalyptic Party",
  "Sipocalypse Level Event"
];

// Rule count for the slider
export const MIN_RULES = 1;
export const MAX_RULES = 11;
export const DEFAULT_RULES = 5;

// Funny activity examples for placeholder - This was already in your constants.js so keeping it.
export const FUNNY_ACTIVITY_EXAMPLES = [
  "Attending a taxidermy convention",
  "Trying to assemble IKEA furniture... blindfolded",
  "Competitive thumb wrestling with a ghost",
  "Explaining cryptocurrency to a confused cat",
  " synchronized swimming in a bathtub",
  "A very serious game of rock, paper, scissors",
  "Debating the philosophical implications of a pop tart",
  "Waiting for the microwave to hit 0:00",
  "Trying to fold a fitted sheet correctly",
  "Staring contest with a pigeon",
  "Parallel parking a unicycle",
  "A dramatic reading of appliance manuals"
];

export const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/sipocalypse.fun',
    icon: React.createElement(
      "svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
      React.createElement("rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5" }),
      React.createElement("path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" }),
      React.createElement("line", { x1: "17.5", y1: "6.5", x2: "17.51", y2: "6.5" })
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@sipocalypse', // Updated URL
    icon: React.createElement(
      "svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
      React.createElement("path", { d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" }),
      React.createElement("path", { d: "M16.05 9.1c.36-.03.73.02 1.09.13.43.13.84.32 1.22.57M10 15.25a1 1 0 1 0-2 0 1 1 0 1 0 2 0Zm5-2.5a1 1 0 1 0-2 0 1 1 0 1 0 2 0Z" }),
      React.createElement("path", { d: "M14.5 9.5A3.5 3.5 0 0 0 11 6V5h2v1a1.5 1.5 0 0 1 1.5-1.5h1.36L15.5 8H17v3.5A3.5 3.5 0 0 1 13.5 15H12v-2h1.5a1.5 1.5 0 0 0 1.5-1.5V9.5Z"})
    ),
  },
  {
    name: 'X',
    href: 'https://x.com/sipocalyps',
    icon: React.createElement(
      "svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
      React.createElement("path", { d: "M18 6 6 18" }),
      React.createElement("path", { d: "m6 6 12 12" })
    ),
  },
];

export const APP_TITLE_PART1 = "SIP";
export const APP_TITLE_PART2 = "OCALYPSE";
