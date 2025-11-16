import type { NextApiRequest, NextApiResponse } from "next";
import { initAuth } from "../../../lib/authMiddleware";
import { storage } from "../../../../server/storage";
import { hashPassword } from "../../../../server/localAuth";
import { withRateLimit } from "../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../server/types";

async function registerHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { username, password, email, firstName, lastName, role } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  const existingUser = await storage.getUserByUsername(username);
  if (existingUser) {
    res.status(400).json({ error: "Username already exists" });
    return;
  }

  const hashedPassword = await hashPassword(password);
  
  const user = await storage.createUser({
    username,
    password: hashedPassword,
    email: email || null,
    firstName: firstName || null,
    lastName: lastName || null,
    role: role || "property_manager",
    themePreference: "light",
  });

  return new Promise<void>((resolve, reject) => {
    (req as any).login(user, (err: Error) => {
      if (err) {
        console.error("Login error after registration:", err);
        res.status(500).json({ error: "Registration succeeded but login failed" });
        return reject(err);
      }
      
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
      resolve();
    });
  });
}

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initAuth(req, res);
    
    return withRateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 })(registerHandler)(req, res);
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
}
