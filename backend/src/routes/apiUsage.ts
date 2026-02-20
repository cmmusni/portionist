import { Request, Response, Router } from "express";
import { apiTracker } from "../utils/apiTracker.js";

const router = Router();

/**
 * GET /api/usage/summary
 * Get current API usage summary
 */
router.get("/summary", (req: Request, res: Response) => {
  try {
    const limits = {
      spoonacular: 150,
      google: 100,
      gemini: 1500,
    };

    const summary = {
      timestamp: new Date().toISOString(),
      period: "Last 24 hours",
      apis: {
        spoonacular: {
          calls: apiTracker.getCallCount("spoonacular"),
          limit: limits.spoonacular,
          percentage: Math.round(
            (apiTracker.getCallCount("spoonacular") / limits.spoonacular) * 100,
          ),
          status:
            apiTracker.getCallCount("spoonacular") / limits.spoonacular >= 0.8
              ? "CRITICAL"
              : apiTracker.getCallCount("spoonacular") / limits.spoonacular >=
                  0.6
                ? "WARNING"
                : "OK",
          isNearLimit: apiTracker.isNearLimit("spoonacular"),
        },
        google: {
          calls: apiTracker.getCallCount("google"),
          limit: limits.google,
          percentage: Math.round(
            (apiTracker.getCallCount("google") / limits.google) * 100,
          ),
          status:
            apiTracker.getCallCount("google") / limits.google >= 0.8
              ? "CRITICAL"
              : apiTracker.getCallCount("google") / limits.google >= 0.6
                ? "WARNING"
                : "OK",
          isNearLimit: apiTracker.isNearLimit("google"),
        },
        gemini: {
          calls: apiTracker.getCallCount("gemini"),
          limit: limits.gemini,
          percentage: Math.round(
            (apiTracker.getCallCount("gemini") / limits.gemini) * 100,
          ),
          status:
            apiTracker.getCallCount("gemini") / limits.gemini >= 0.8
              ? "CRITICAL"
              : apiTracker.getCallCount("gemini") / limits.gemini >= 0.6
                ? "WARNING"
                : "OK",
          isNearLimit: apiTracker.isNearLimit("gemini"),
        },
      },
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    console.error("Error getting API usage summary:", error);
    res.status(500).json({ success: false, error: "Failed to get API usage" });
  }
});

/**
 * GET /api/usage/detailed
 * Get detailed API usage report
 */
router.get("/detailed", (req: Request, res: Response) => {
  try {
    const report = apiTracker.getDetailedReport();

    res.json({
      success: true,
      data: {
        report,
        spoonacularCalls: apiTracker.getCalls("spoonacular"),
        googleCalls: apiTracker.getCalls("google"),
        geminiCalls: apiTracker.getCalls("gemini"),
      },
    });
  } catch (error) {
    console.error("Error getting detailed API usage:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get detailed usage" });
  }
});

/**
 * POST /api/usage/reset
 * Reset API usage tracker (for testing only)
 */
router.post("/reset", (req: Request, res: Response) => {
  try {
    apiTracker.reset();
    res.json({ success: true, message: "API usage tracker reset" });
  } catch (error) {
    console.error("Error resetting API usage tracker:", error);
    res.status(500).json({ success: false, error: "Failed to reset tracker" });
  }
});

export default router;
