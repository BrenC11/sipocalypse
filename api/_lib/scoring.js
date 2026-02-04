export const calculateDailyScore = ({ activity, chaosLevel, ruleCount, dareCount, chaosScore }) => {
  const safeChaos = Math.max(1, Math.min(4, Number(chaosLevel) || 1));
  const safeRules = Math.max(0, Number(ruleCount) || 0);
  const safeDares = Math.max(0, Number(dareCount) || 0);
  const safeChaosScore = Math.max(0, Number(chaosScore) || 0);
  const wordCount = typeof activity === "string" ? activity.trim().split(/\s+/).filter(Boolean).length : 0;

  const baseChaos = safeChaos * 18;
  const rulePoints = Math.min(24, safeRules * 3);
  const darePoints = Math.min(18, safeDares * 4);
  const activityPoints = Math.min(12, wordCount * 2);
  const chaosBoost = Math.min(16, safeChaosScore * 0.16);

  return Math.max(0, Math.min(100, Math.round(baseChaos + rulePoints + darePoints + activityPoints + chaosBoost)));
};

export const buildWinnerImagePrompt = ({ activity, score, date }) =>
  `Design a bold social media winner card for Sipocalypse. Headline: Apocalypse Winner of the Day. Activity: ${activity}. Score: ${score}/100. Date: ${date}. Style: chaotic party vibes, vibrant neon, readable typography, 1:1 format.`;

export const buildSocialCaption = ({ activity, score, date }) =>
  `Apocalypse Winner of the Day (${date}): ${activity} scored ${score}/100. Think you can beat this chaos tomorrow? #Sipocalypse #DrinkingGames #PartyGame`;
