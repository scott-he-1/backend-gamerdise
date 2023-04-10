import { prisma } from "../prisma/db.setup";
import { encryptPassword } from "../src/auth-utils";
const clearDb = async () => {
  await prisma.notification.deleteMany();
  await prisma.userToCartItems.deleteMany();
  await prisma.postedItem.deleteMany();
  await prisma.user.deleteMany();
};

const seed = async () => {
  console.log("Seeding database...");
  await clearDb();

  const testUser = await prisma.user.create({
    data: {
      email: "test@test.com",
      passwordHash: await encryptPassword("password"),
    },
  });

  const testUser2 = await prisma.user.create({
    data: {
      email: "test2@test.com",
      passwordHash: await encryptPassword("password"),
    },
  });

  const postedItem = await prisma.postedItem.create({
    data: {
      name: "Cloud's buster sword",
      description: "Cloud from the Final Fantasy series' most iconic weapon!",
      image:
        "https://i.etsystatic.com/19865148/r/il/abbbf2/2344547638/il_fullxfull.2344547638_33th.jpg",
      category: "prop",
      price: 249.99,
      posterId: testUser.id,
      posterName: testUser.email,
    },
  });

  const postedItem2 = await prisma.postedItem.create({
    data: {
      name: "Undertale Hoodie",
      description: "An Undertale hoodie made from cotton!",
      image:
        "https://i.etsystatic.com/10959826/r/il/87342b/3201684843/il_fullxfull.3201684843_1bb0.jpg",
      category: "apparel",
      price: 24.99,
      posterId: testUser.id,
      posterName: testUser.email,
    },
  });
  const postedItem3 = await prisma.postedItem.create({
    data: {
      name: "Game Boy Advance SP",
      description:
        "Almost new, Game Boy SP from way back in the past. Still fully functional.",
      image: "https://m.media-amazon.com/images/I/81E9LMtyupL.jpg",
      category: "electronic",
      price: 49.99,
      posterId: testUser.id,
      posterName: testUser.email,
    },
  });
  const postedItem4 = await prisma.postedItem.create({
    data: {
      name: "Pokemon Platinum",
      description:
        "A Pokemon game from the world-famous Pokemon series. Requires a Nintendo DS to be able to play",
      image: "https://i.ebayimg.com/images/g/RBcAAOSw8XZjV6ev/s-l640.jpg",
      category: "game",
      price: 39.99,
      posterId: testUser.id,
      posterName: testUser.email,
    },
  });
  const postedItem5 = await prisma.postedItem.create({
    data: {
      name: "Witcher key chain",
      description:
        "A key chain from the Witcher series. Worn by Geralt of Rivia",
      image:
        "https://ae01.alicdn.com/kf/Hfc176773242e4d6ca0d0b6a3d8635d0c3/Wild-Hunt-Game-Key-Chain-Wolf-Head-keyring-Metal-Medallion-Gaming-Peripherals-Zinc-Alloy-Men-Keychain.jpg",
      category: "accessory",
      price: 29.99,
      posterId: testUser.id,
      posterName: testUser.email,
    },
  });

  await prisma.userToCartItems.create({
    data: {
      userId: testUser2.id,
      postedItemId: postedItem.id,
    },
  });

  await prisma.userToCartItems.create({
    data: {
      userId: testUser2.id,
      postedItemId: postedItem2.id,
    },
  });

  await prisma.notification.create({
    data: {
      message: "Test Message",
      user: {
        connect: {
          id: testUser?.id,
        },
      },
    },
  });
};

seed()
  .then(() => console.log("Seeding complete"))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
