import { NextApiRequest, NextApiResponse } from "next";
import { storage } from "../../../../server/storage";
import { requireAuth } from "../../../lib/authMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === "GET") {
    try {
      const userProfile = await storage.getUser(user.id);
      if (!userProfile) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json(userProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res.status(500).json({ error: "Failed to fetch user profile" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { firstName, lastName, email, themePreference } = req.body;
      
      const updatedUser = await storage.updateUserProfile(user.id, {
        firstName,
        lastName,
        email,
        themePreference,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      return res.status(500).json({ error: "Failed to update user profile" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
