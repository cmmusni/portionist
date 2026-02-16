import type { Request, Response } from "express";
import { query } from "../db/connection.js";

interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
}

interface OnboardingDataRequest {
  userAge?: number;
  currentWeight?: number;
  targetWeight?: number;
  cuisine?: string;
}

interface ProfileResponse {
  userId: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

interface OnboardingDataResponse {
  userId: string;
  userAge: number | null;
  currentWeight: number | null;
  targetWeight: number | null;
  cuisine: string | null;
  createdAt: string;
  updatedAt: string;
}

const profileController = {
  /**
   * Get user profile details
   * GET /profile/:userId
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;

      // Validation
      if (!userId) {
        res.status(400).json({ error: "Missing required parameter: userId" });
        return;
      }

      // Fetch user from database
      const result = await query(
        "SELECT user_id, email, full_name, created_at, updated_at FROM users WHERE user_id = $1",
        [userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const user = result.rows[0];
      const response: ProfileResponse = {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };

      res.status(200).json({
        message: "Profile retrieved successfully",
        data: response,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * Update user profile
   * PUT /profile/:userId
   * Body: { fullName?, email? }
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { fullName, email } = req.body as UpdateProfileRequest;

      // Validation
      if (!userId) {
        res.status(400).json({ error: "Missing required parameter: userId" });
        return;
      }

      // Check if user exists
      const userExists = await query("SELECT * FROM users WHERE user_id = $1", [
        userId,
      ]);

      if (userExists.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Build dynamic update query
      const updates: string[] = [];
      const values: (string | number)[] = [];
      let paramCount = 1;

      if (fullName) {
        updates.push(`full_name = $${paramCount}`);
        values.push(fullName);
        paramCount++;
      }

      if (email) {
        // Check if email already exists for another user
        const emailExists = await query(
          "SELECT * FROM users WHERE email = $1 AND user_id != $2",
          [email, userId],
        );

        if (emailExists.rows.length > 0) {
          res.status(409).json({ error: "Email already in use" });
          return;
        }

        updates.push(`email = $${paramCount}`);
        values.push(email);
        paramCount++;
      }

      if (updates.length === 0) {
        res
          .status(400)
          .json({ error: "No fields to update. Provide fullName or email" });
        return;
      }

      // Add updated_at timestamp
      updates.push(`updated_at = NOW()`);
      values.push(userId);

      const updateQuery = `
        UPDATE users 
        SET ${updates.join(", ")} 
        WHERE user_id = $${paramCount}
        RETURNING user_id, email, full_name, created_at, updated_at
      `;

      const result = await query(updateQuery, values);
      const user = result.rows[0];

      const response: ProfileResponse = {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };

      res.status(200).json({
        message: "Profile updated successfully",
        data: response,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * Save or update onboarding data
   * POST /profile/:userId/onboarding
   * Body: { userAge?, currentWeight?, targetWeight?, cuisine? }
   */
  async saveOnboardingData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { userAge, currentWeight, targetWeight, cuisine } =
        req.body as OnboardingDataRequest;

      // Validation
      if (!userId) {
        res.status(400).json({ error: "Missing required parameter: userId" });
        return;
      }

      // Check if user exists
      const userExists = await query("SELECT * FROM users WHERE user_id = $1", [
        userId,
      ]);

      if (userExists.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Check if onboarding data already exists
      const existingData = await query(
        "SELECT * FROM onboarding_data WHERE user_id = $1",
        [userId],
      );

      let result;

      if (existingData.rows.length > 0) {
        // Update existing onboarding data
        result = await query(
          `UPDATE onboarding_data 
           SET user_age = COALESCE($2, user_age),
               current_weight = COALESCE($3, current_weight),
               target_weight = COALESCE($4, target_weight),
               cuisine = COALESCE($5, cuisine),
               updated_at = NOW()
           WHERE user_id = $1
           RETURNING user_id, user_age, current_weight, target_weight, cuisine, created_at, updated_at`,
          [
            userId,
            userAge !== undefined ? userAge : null,
            currentWeight !== undefined ? currentWeight : null,
            targetWeight !== undefined ? targetWeight : null,
            cuisine !== undefined ? cuisine : null,
          ],
        );
      } else {
        // Insert new onboarding data
        result = await query(
          `INSERT INTO onboarding_data (user_id, user_age, current_weight, target_weight, cuisine)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING user_id, user_age, current_weight, target_weight, cuisine, created_at, updated_at`,
          [
            userId,
            userAge !== undefined ? userAge : null,
            currentWeight !== undefined ? currentWeight : null,
            targetWeight !== undefined ? targetWeight : null,
            cuisine !== undefined ? cuisine : null,
          ],
        );
      }

      const data = result.rows[0];
      const response: OnboardingDataResponse = {
        userId: data.user_id,
        userAge: data.user_age,
        currentWeight: data.current_weight,
        targetWeight: data.target_weight,
        cuisine: data.cuisine,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      res.status(200).json({
        message: "Onboarding data saved successfully",
        data: response,
      });
    } catch (error) {
      console.error("Save onboarding data error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * Get onboarding data for a user
   * GET /profile/:userId/onboarding
   */
  async getOnboardingData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;

      // Validation
      if (!userId) {
        res.status(400).json({ error: "Missing required parameter: userId" });
        return;
      }

      // Fetch onboarding data
      const result = await query(
        "SELECT user_id, user_age, current_weight, target_weight, cuisine, created_at, updated_at FROM onboarding_data WHERE user_id = $1",
        [userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Onboarding data not found" });
        return;
      }

      const data = result.rows[0];
      const response: OnboardingDataResponse = {
        userId: data.user_id,
        userAge: data.user_age,
        currentWeight: data.current_weight,
        targetWeight: data.target_weight,
        cuisine: data.cuisine,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      res.status(200).json({
        message: "Onboarding data retrieved successfully",
        data: response,
      });
    } catch (error) {
      console.error("Get onboarding data error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

export default profileController;
