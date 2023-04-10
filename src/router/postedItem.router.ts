import { Router } from "express";
import { validateRequest } from "zod-express-middleware";
import "express-async-errors";
import { z } from "zod";
import { prisma } from "../../prisma/db.setup";
import { authMiddleware } from "../auth-utils";

const postedItemsController = Router();

postedItemsController.get("/postedItems", async (req, res) => {
  const allPostedItems = await prisma.postedItem.findMany();
  return res.json(allPostedItems);
});

postedItemsController.get("/postedItems/:id", async (req, res) => {
  const itemId = parseInt(req.params.id);
  if (!itemId) {
    return res.status(401).json({ message: "ID must be a number" });
  }
  const item = await prisma.postedItem.findFirst({
    where: {
      id: itemId,
    },
  });
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  return res.status(200).json(item);
});

postedItemsController.post(
  "/postedItems",
  validateRequest({
    body: z.object({
      name: z.string(),
      description: z.string(),
      image: z.string(),
      category: z.string(),
      price: z.number(),
      posterId: z.number(),
    }),
  }),
  authMiddleware,
  async (req, res) => {
    const { name, description, image, category, price, posterId } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        id: posterId,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Poster name not found" });
    }
    const newItem = await prisma.postedItem.create({
      data: {
        name,
        description,
        image,
        category,
        price,
        posterId,
        posterName: user.email,
      },
    });
    return res.status(200).json(newItem);
  }
);

postedItemsController.delete(
  "/postedItems/:id",
  authMiddleware,
  async (req, res) => {
    const itemId = parseInt(req.params.id);
    if (!itemId) {
      return res.status(400).json({ message: "ID must be a number" });
    }

    const itemToBeDeleted = await prisma.postedItem.findFirst({
      where: {
        id: itemId,
      },
    });
    if (!itemToBeDeleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    const otherUsersWithThisItemInCart = await prisma.userToCartItems
      .findMany({
        where: {
          postedItemId: itemToBeDeleted.id,
        },
        select: {
          userId: true,
        },
      })
      .then((item) => item.map((item) => item.userId));

    await prisma.userToCartItems
      .deleteMany({
        where: {
          postedItemId: itemToBeDeleted.id,
        },
      })
      .then(async () => {
        for (const user of otherUsersWithThisItemInCart) {
          await prisma.notification.create({
            data: {
              message: `The item \'${itemToBeDeleted.name}\' that was in your cart was removed from the market.`,
              user: {
                connect: {
                  id: user,
                },
              },
            },
          });
        }
      })
      .catch((e) => console.error(e));

    await prisma.postedItem.delete({
      where: {
        id: itemToBeDeleted.id,
      },
    });

    return res.status(200).json(itemToBeDeleted);
  }
);

export { postedItemsController };
