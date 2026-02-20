import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Request, Response } from "express";
import { query } from "../db/connection.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface MotivationResponse {
  success: boolean;
  data?: {
    motivation: string;
    isNew: boolean;
  };
  error?: string;
}

// Fallback motivations when Gemini API is not available
const FALLBACK_MOTIVATIONS = [
  "Nourish your body, fuel your dreams with every healthy bite.",
  "Every healthy meal is a step towards a better you.",
  "Choose foods that make your body thank you later.",
  "Healthy eating today creates a stronger tomorrow.",
  "Your body deserves the best fuel you can give it.",
  "Small healthy choices today, big changes tomorrow.",
  "Eat well, feel great, live better every single day.",
  "Fuel your body right, achieve your goals with might.",
  "Healthy habits create a lifetime of wellness and joy.",
  "Choose nutrition, embrace vitality, celebrate life with every meal.",
  "Your health is an investment, not an expense. Eat wisely.",
  "Good food, good mood, good life - it all starts here.",
  "Balance your plate, balance your life, balance your future.",
  "Each meal is a chance to show your body love.",
  "Eat the rainbow, feel the energy, live your best life.",
  "Wholesome foods build strong bodies and sharper minds.",
  "Mindful eating leads to a mindful, joyful existence.",
  "Treat your body like a temple with nutritious choices.",
  "Fresh ingredients, fresh start, fresh perspective on health.",
  "Healthy eating isn't a diet, it's a lifestyle choice.",
  "Power your day with wholesome, delicious, nourishing meals.",
  "Choose quality over quantity, health over convenience always.",
  "Your future self will thank you for eating well today.",
  "Vibrant foods create vibrant health and vibrant energy.",
  "Make peace with food, make friends with your health.",
  "Nutrition is the foundation of a strong, healthy life.",
  "Feed your body well, and it will serve you well.",
  "Healthy eating is self-love in its purest form.",
  "Good nutrition today means better health for all tomorrows.",
  "Choose real food, real health, real happiness, real results.",
];

export class MotivationController {
  /**
   * Get or generate a daily motivation
   */
  async getDailyMotivation(req: Request, res: Response): Promise<void> {
    try {
      console.log("[Motivation] Fetching daily motivation...");

      // Try to get a random existing motivation from the database
      const existingResult = await query(
        `SELECT motivation_text FROM daily_motivations 
         ORDER BY RANDOM() 
         LIMIT 1`,
      );

      // If we have at least 30 motivations, just return a random one
      const countResult = await query(
        `SELECT COUNT(*) as count FROM daily_motivations`,
      );
      const motivationCount = parseInt(countResult.rows[0]?.count || "0");

      if (motivationCount >= 30 && existingResult.rows.length > 0) {
        console.log(
          `[Motivation] Returning existing motivation (${motivationCount} total)`,
        );
        res.json({
          success: true,
          data: {
            motivation: existingResult.rows[0].motivation_text,
            isNew: false,
          },
        } as MotivationResponse);
        return;
      }

      // Generate a new unique motivation
      console.log("[Motivation] Generating new motivation with Gemini AI...");

      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        console.log(
          "[Motivation] Gemini API key not configured, using fallback motivations",
        );
        return this.useFallbackMotivation(res, existingResult);
      }

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Get existing motivations to avoid duplicates
        const allMotivationsResult = await query(
          `SELECT motivation_text FROM daily_motivations`,
        );
        const existingMotivations = allMotivationsResult.rows.map(
          (row) => row.motivation_text,
        );

        const prompt = `Generate a short, inspiring motivational quote (maximum 15 words) about eating healthy meals and maintaining a balanced diet. 
The quote should be positive, encouraging, and focused on wellness.
Make it unique and different from these existing quotes: ${existingMotivations.join(", ") || "none yet"}
Return ONLY the quote itself, no quotes marks, no attribution, no extra text.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let motivationText = response.text().trim();

        // Clean up the response
        motivationText = motivationText.replace(/^["']|["']$/g, ""); // Remove quotes
        motivationText = motivationText.replace(/\n/g, " "); // Remove newlines
        motivationText = motivationText.substring(0, 200); // Limit length

        // Check if this motivation already exists
        const duplicateCheck = await query(
          `SELECT id FROM daily_motivations WHERE motivation_text = $1`,
          [motivationText],
        );

        if (duplicateCheck.rows.length > 0) {
          console.log("[Motivation] Generated duplicate, using existing one");
          // Return the random existing one we fetched earlier
          if (existingResult.rows.length > 0) {
            res.json({
              success: true,
              data: {
                motivation: existingResult.rows[0].motivation_text,
                isNew: false,
              },
            } as MotivationResponse);
            return;
          }
        }

        // Save the new motivation to the database
        await query(
          `INSERT INTO daily_motivations (motivation_text) VALUES ($1)
         ON CONFLICT (motivation_text) DO NOTHING`,
          [motivationText],
        );

        console.log("[Motivation] New motivation generated and saved");

        res.json({
          success: true,
          data: {
            motivation: motivationText,
            isNew: true,
          },
        } as MotivationResponse);
      } catch (apiError) {
        console.error(
          "[Motivation] Gemini API error, falling back to predefined motivations:",
          apiError,
        );
        return this.useFallbackMotivation(res, existingResult);
      }
    } catch (error) {
      console.error("[Motivation] Error:", error);
      // Use fallback motivation instead of returning error
      return this.useFallbackMotivation(res, null);
    }
  }

  /**
   * Use a fallback motivation from predefined list
   */
  private async useFallbackMotivation(
    res: Response,
    existingResult: any,
  ): Promise<void> {
    try {
      // Get existing motivations from DB to avoid duplicates
      const allMotivationsResult = await query(
        `SELECT motivation_text FROM daily_motivations`,
      );
      const existingMotivations = new Set(
        allMotivationsResult.rows.map((row) => row.motivation_text),
      );

      // Find a fallback motivation that doesn't exist in DB yet
      let selectedMotivation: string =
        FALLBACK_MOTIVATIONS[0] || "Eat well, feel great, live better!";
      let foundNewMotivation = false;

      for (const fallback of FALLBACK_MOTIVATIONS) {
        if (!existingMotivations.has(fallback)) {
          selectedMotivation = fallback;
          foundNewMotivation = true;
          break;
        }
      }

      // If all fallback motivations already exist, return a random existing one
      if (!foundNewMotivation) {
        if (existingResult?.rows?.length > 0) {
          res.json({
            success: true,
            data: {
              motivation: existingResult.rows[0].motivation_text,
              isNew: false,
            },
          } as MotivationResponse);
          return;
        }
        // Last resort - pick a random fallback
        selectedMotivation =
          FALLBACK_MOTIVATIONS[
            Math.floor(Math.random() * FALLBACK_MOTIVATIONS.length)
          ] || "Healthy eating is self-love in its purest form.";
      }

      // Try to save to database
      try {
        await query(
          `INSERT INTO daily_motivations (motivation_text) VALUES ($1)
           ON CONFLICT (motivation_text) DO NOTHING`,
          [selectedMotivation],
        );
        console.log("[Motivation] Fallback motivation saved to database");
      } catch (dbError) {
        console.error("[Motivation] Could not save fallback to DB:", dbError);
      }

      res.json({
        success: true,
        data: {
          motivation: selectedMotivation,
          isNew: true,
        },
      } as MotivationResponse);
    } catch (error) {
      console.error("[Motivation] Fallback error:", error);
      // Last resort - just return a random motivation without DB
      res.json({
        success: true,
        data: {
          motivation:
            FALLBACK_MOTIVATIONS[
              Math.floor(Math.random() * FALLBACK_MOTIVATIONS.length)
            ],
          isNew: false,
        },
      } as MotivationResponse);
    }
  }

  /**
   * Get all motivations (admin/debug endpoint)
   */
  async getAllMotivations(req: Request, res: Response): Promise<void> {
    try {
      const result = await query(
        `SELECT id, motivation_text, created_at 
         FROM daily_motivations 
         ORDER BY created_at DESC`,
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error("[Motivation] Error fetching all motivations:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch motivations",
      });
    }
  }
}

export const motivationController = new MotivationController();
