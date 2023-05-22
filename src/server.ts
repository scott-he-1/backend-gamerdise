import express from "express";
import "express-async-errors";
import { authController } from "./router/auth.router";
import { notificationController } from "./router/notification.router";
import { postedItemsController } from "./router/postedItem.router";
import { userController } from "./router/user.router";
import { userToCartItemsController } from "./router/userToCartItems.router";
import cors from "cors";
import { seeder } from "../prisma/seed";

["DATABASE_URL", "JWT_SECRET", "PORT"].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable ${key}`);
  }
});
const port = process.env["PORT"] || 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.send("Hello");
});

app.post("/seeder", async (req, res) => {
  return seeder();
});

app.use(authController);
app.use(userController);
app.use(postedItemsController);
app.use(notificationController);
app.use(userToCartItemsController);

app.listen(port, () => console.log(`Server is running on port ${port}`));
