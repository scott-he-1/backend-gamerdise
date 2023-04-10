import { Router } from "express";
import "express-async-errors";
import { prisma } from "../../prisma/db.setup";
import { authMiddleware } from "../auth-utils";

const notificationController = Router();

notificationController.delete(
  "/notification/:id",
  authMiddleware,
  async (req, res) => {
    const notificationId = parseInt(req.params.id);
    if (!notificationId) {
      return res.status(400).json({ message: "ID must be a number" });
    }
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
      },
    });
    if (!notification) {
      return res.status(400).json({ message: "Notification not found" });
    }

    if (req.user?.id !== notification?.userId) {
      return res
        .status(409)
        .json({ message: "User is not allowed to delete notification" });
    }

    await prisma.notification
      .delete({
        where: {
          id: notification.id,
        },
      })
      .then(() => {
        return res.status(200).json(notification);
      })
      .catch(() => {
        return res.status(401).json({ message: "Something went wrong" });
      });
  }
);

export { notificationController };
