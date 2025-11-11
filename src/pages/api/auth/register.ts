import type { NextApiRequest, NextApiResponse } from "next";
import passport from "passport";
import { initAuth } from "../../../lib/authMiddleware";
import { storage } from "../../../../server/storage";
import { hashPassword } from "../../../../server/localAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initAuth(req, res);

    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await hashPassword(password);
    
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      email: email || null,
      firstName: firstName || null,
      lastName: lastName || null,
      themePreference: "light",
    });

    (req as any).login(user, (err: Error) => {
      if (err) {
        console.error("Login error after registration:", err);
        return res.status(500).json({ error: "Registration succeeded but login failed" });
      }
      
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
}
