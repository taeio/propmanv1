import type { NextApiResponse } from "next";
import { storage } from "../../../../server/storage";
import { compose, requireAuth, validateBody } from "../../../../server/middleware";
import { AuthenticatedRequest } from "../../../../server/types";
import { UserProfileSchema } from "../../../../shared/validation";
import { initAuth } from "../../../lib/authMiddleware";

async function handleGet(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const userProfile = await storage.getUser(userId);
  if (!userProfile) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.status(200).json(userProfile);
}

async function handlePut(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const userId = req.user!.id;
  const { firstName, lastName, email, themePreference } = req.body;
  
  const updatedUser = await storage.updateUserProfile(userId, {
    firstName,
    lastName,
    email,
    themePreference,
  });

  if (!updatedUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(200).json(updatedUser);
}

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    await initAuth(req, res);

    if (req.method === "GET") {
      return compose(requireAuth)(handleGet)(req, res);
    }

    if (req.method === "PUT") {
      return compose(
        requireAuth,
        validateBody(UserProfileSchema)
      )(handlePut)(req, res);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error with user profile:", error);
    return res.status(500).json({ error: "Failed to process request" });
  }
}
