import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";
import { z } from "zod";
import { prisma } from "../../prisma/db.setup";
import { authMiddleware, encryptPassword } from "../auth-utils";

const userController = Router();

userController.get("/user/:id/postedItems", async (req, res) => {
  const userId = parseInt(req.params.id);
  if (!userId) {
    return res.status(401).json({ message: "ID is not a number" });
  }
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: { postedItems: true },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(user.postedItems);
});

userController.get(
  "/user/:id/notifications",
  authMiddleware,
  async (req, res) => {
    const requestorId = parseInt(String(req.user?.id));
    const userId = parseInt(req.params.id);
    if (!userId) {
      return res.status(401).json({ message: "ID is not a number" });
    }
    if (requestorId !== userId) {
      return res.status(409).json({ message: "Authorization error" });
    }

    const notifications = await prisma.user.findMany({
      where: {
        id: userId,
      },
      select: {
        notifications: true,
      },
    });

    return res.status(200).json(notifications[0].notifications);
  }
);

userController.post(
  "/user",
  validateRequest({
    body: z.object({ email: z.string().email(), password: z.string() }),
  }),
  async (req, res) => {
    const emailAlreadyExists = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    });
    if (emailAlreadyExists) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        passwordHash: await encryptPassword(req.body.password),
      },
    });

    return res.status(200).send(newUser);
  }
);

export { userController };
