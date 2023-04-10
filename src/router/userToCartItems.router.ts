import { Router } from "express";
import "express-async-errors";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { prisma } from "../../prisma/db.setup";
import { authMiddleware } from "../auth-utils";

const userToCartItemsController = Router();

userToCartItemsController.get(
  "/user/:id/cartItems",
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

    const userCartItems = await prisma.userToCartItems.findMany({
      where: {
        userId,
      },
      select: {
        postedItem: true,
      },
    });
    return res.status(200).json(userCartItems);
  }
);

userToCartItemsController.post(
  "/user/:id/cartItems",
  validateRequest({
    body: z.object({
      itemId: z.number(),
    }),
  }),
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
    const cartItemToAdd = await prisma.postedItem.findFirst({
      where: {
        id: req.body.itemId,
      },
    });

    if (!cartItemToAdd) {
      return res.status(404).json({ message: "Item does not exist" });
    }

    await prisma.userToCartItems.create({
      data: {
        userId,
        postedItemId: cartItemToAdd.id,
      },
    });
    return res.status(200).json(cartItemToAdd);
  }
);

userToCartItemsController.delete(
  "/user/:id/cartItems",
  authMiddleware,
  validateRequest({
    body: z.object({
      itemId: z.number(),
    }),
  }),
  async (req, res) => {
    const requestorId = parseInt(String(req.user?.id));
    const userId = parseInt(req.params.id);
    if (!userId) {
      return res.status(401).json({ message: "ID is not a number" });
    }
    if (requestorId !== userId) {
      return res.status(409).json({ message: "Authorization error" });
    }

    const deleted = await prisma.userToCartItems.delete({
      where: {
        userId_postedItemId: {
          userId,
          postedItemId: req.body.itemId,
        },
      },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    return res.status(200).json(deleted);
  }
);

export { userToCartItemsController };
