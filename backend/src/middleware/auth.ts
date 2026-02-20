import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
}

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Middleware to verify JWT token and extract userId
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Unauthorized - No token provided",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get JWT secret from environment or use default
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-this";

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: "Unauthorized - Invalid token",
      });
      return;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Optional auth middleware - continues even if no token provided
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-this";

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      req.userId = decoded.userId;
    } catch (error) {
      // Invalid token, but we continue anyway for optional auth
      console.warn("Optional auth: Invalid token");
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next();
  }
};
