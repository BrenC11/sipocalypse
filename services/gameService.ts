
import { GeneratedGame } from '../types';

const GAME_GENERATOR_WEBHOOK_URL = 'https://hook.eu2.make.com/8ym052altan60ddmeki1zl2160f1ghxr';
const DARE_SEPARATOR_KEYWORD = "###";

// Cleans rule/dare lines: removes leading numbering (e.g., "1. "), trims, and filters empty.
const cleanAndDeduplicatePotentialRules = (lines: string[]): string[] => {
  if (!Array.isArray(lines)) return [];
  return lines
    .map(line => line.replace(/^\s*\d+\.\s*/, '').trim())
    .filter(Boolean); // filter(Boolean) removes empty strings
};

interface GameGenerationParams {
  activity: string;
  chaosLevel: number;
  includeDares: boolean;
  numberOfRules: number;
}

export const generateGameViaWebhook = async (params: GameGenerationParams): Promise<GeneratedGame> => {
  if (!params.activity || params.activity.trim() === "") {
    throw new Error("Activity must be provided to generate a game.");
  }

  try {
    let response: Response;
    try {
      response = await fetch(GAME_GENERATOR_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (networkError: any) {
      console.error("Network error calling webhook:", networkError);
      throw new Error(`Failed to connect to the game generator: ${networkError.message || 'Check your internet connection.'}`);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error body.');
      throw new Error(`Webhook request failed with status: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log("Webhook Raw Response Text:", responseText);

    let finalTitle: string;
    let finalRules: string[];
    let finalDares: string[] = [];

    // --- Start of Simplified Parsing Logic ---
    try {
      // IDEAL JSON PATH: Try to parse as the perfect JSON object first.
      const parsedJson = JSON.parse(responseText);
      if (parsedJson && typeof parsedJson.title === 'string' && Array.isArray(parsedJson.rules)) {
        console.log("PARSING: Success with ideal JSON structure.");
        finalTitle = parsedJson.title;
        finalRules = cleanAndDeduplicatePotentialRules(parsedJson.rules);
        if (Array.isArray(parsedJson.dares)) {
          finalDares = cleanAndDeduplicatePotentialRules(parsedJson.dares);
        }
      } else {
        // Force fallback if JSON isn't the ideal object.
        throw new Error("JSON not ideal, using fallback parser.");
      }
    } catch (e) {
      // UNIFIED FALLBACK PATH: For any plain text or non-ideal JSON.
      console.log("PARSING: Using unified fallback for plain text or non-ideal JSON.");

      if (typeof responseText !== 'string' || !responseText.trim()) {
        throw new Error("Game generator returned an empty or invalid response.");
      }
      
      const parts = responseText.split(DARE_SEPARATOR_KEYWORD);
      console.log(`PARSING (Fallback): Split response into ${parts.length} parts.`);

      // This is the hardened logic to prevent "split on undefined" errors.
      finalTitle = (parts[0] ?? '').trim();
      finalRules = cleanAndDeduplicatePotentialRules((parts[1] ?? '').split('\n'));
      finalDares = cleanAndDeduplicatePotentialRules((parts[2] ?? '').split('\n'));
    }
    // --- End of Simplified Parsing Logic ---


    // --- Final Assembly ---
    if (!finalTitle) {
      finalTitle = `Sipocalypse Game for '${params.activity}'`;
      console.warn("No title found, using default.");
    }
    
    const finalGame: GeneratedGame = {
      title: finalTitle,
      rules: finalRules.slice(0, params.numberOfRules),
      dares: []
    };

    if (params.includeDares) {
      // If we got dares from the third '###' part, use them.
      if (finalDares.length > 0) {
        finalGame.dares = finalDares;
      } 
      // Otherwise, check for overflow from rules (if dares part was empty).
      else if (finalRules.length > params.numberOfRules) {
        finalGame.dares = finalRules.slice(params.numberOfRules);
      }
    }

    if (finalGame.rules.length === 0 && finalGame.dares.length === 0) {
      console.warn("No rules or dares were successfully parsed. The game is empty.");
    }

    console.log("FINAL GAME OBJECT:", JSON.stringify(finalGame, null, 2));
    return finalGame;

  } catch (error: any) {
    console.error("SERVICE CRITICAL ERROR:", error);
    // Ensure we always throw a standard Error object
    throw new Error(error.message || "An unknown error occurred in the game service.");
  }
};
