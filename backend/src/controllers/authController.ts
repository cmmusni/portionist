import type { Request, Response } from "express";
import { query } from "../db/connection.js";

interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
}

interface SignInRequest {
  email: string;
  password: string;
}

interface FacebookAuthRequest {
  facebookId: string;
  fullName: string;
  email?: string;
}

interface AuthResponse {
  userId: string;
  email: string;
  fullName: string;
  token: string;
}

const authController = {
  /**
   * Sign up a new user
   * POST /auth/signup
   * Body: { email, password, fullName }
   */
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName } = req.body as SignUpRequest;

      // Validation
      if (!email || !password || !fullName) {
        res.status(400).json({
          error: "Missing required fields: email, password, fullName",
        });
        return;
      }

      // Check if user already exists
      const existingUser = await query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (existingUser.rows.length > 0) {
        res.status(409).json({ error: "User with this email already exists" });
        return;
      }

      // Create new user
      const userId = "user-" + Date.now();
      // TODO: Hash the password with bcrypt in production!
      await query(
        "INSERT INTO users (user_id, email, password, full_name) VALUES ($1, $2, $3, $4)",
        [userId, email, password, fullName],
      );

      // Generate token (TODO: Use JWT in production)
      const token = "token-" + Date.now() + "-" + Math.random();

      const response: AuthResponse = {
        userId,
        email,
        fullName,
        token,
      };

      res.status(201).json({
        message: "User created successfully",
        data: response,
      });
    } catch (error) {
      console.error("Sign up error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * Sign in an existing user
   * POST /auth/signin
   * Body: { email, password }
   */
  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as SignInRequest;

      // Validation
      if (!email || !password) {
        res.status(400).json({
          error: "Missing required fields: email, password",
        });
        return;
      }

      // Find user
      const result = await query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (result.rows.length === 0) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const user = result.rows[0];

      // TODO: Use bcrypt.compare() in production!
      if (user.password !== password) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Generate token (TODO: Use JWT in production)
      const token = "token-" + Date.now() + "-" + Math.random();

      const response: AuthResponse = {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        token,
      };

      res.status(200).json({
        message: "Sign in successful",
        data: response,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * Sign in/up via Facebook
   * POST /auth/facebook
   * Body: { facebookId, fullName, email? }
   */
  async facebookAuth(req: Request, res: Response): Promise<void> {
    try {
      const { facebookId, fullName, email } = req.body as FacebookAuthRequest;

      // Validation
      if (!facebookId || !fullName) {
        res.status(400).json({
          error: "Missing required fields: facebookId, fullName",
        });
        return;
      }

      // Check if user already exists by Facebook ID
      let result = await query("SELECT * FROM users WHERE facebook_id = $1", [
        facebookId,
      ]);

      let user = result.rows[0];
      let isNewUser = false;

      // If user doesn't exist, create them
      if (!user) {
        const userId = "user-" + Date.now();
        await query(
          "INSERT INTO users (user_id, facebook_id, email, full_name) VALUES ($1, $2, $3, $4)",
          [userId, facebookId, email || null, fullName],
        );
        isNewUser = true;
        user = {
          user_id: userId,
          facebook_id: facebookId,
          email: email || null,
          full_name: fullName,
        };
      }

      // Generate token (TODO: Use JWT in production)
      const token = "token-" + Date.now() + "-" + Math.random();

      const response: AuthResponse = {
        userId: user.user_id,
        email: user.email || "",
        fullName: user.full_name,
        token,
      };

      res.status(isNewUser ? 201 : 200).json({
        message: isNewUser ? "User created successfully" : "Sign in successful",
        data: response,
      });
    } catch (error) {
      console.error("Facebook auth error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * Sign out a user
   * POST /auth/signout
   * Body: { userId }
   */
  async signOut(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;

      // Validation
      if (!userId) {
        res.status(400).json({
          error: "Missing required field: userId",
        });
        return;
      }

      // Log sign out (in a real app, you might invalidate tokens here)
      console.log(`User ${userId} signed out`);

      res.status(200).json({
        message: "Sign out successful",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

export default authController;
