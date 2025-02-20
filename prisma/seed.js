const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

async function seed() {
  //admin
  try {
    const hashedPassword = await bcrypt.hash("grace123", 8);

    const existingAdmin = await prisma.user.findUnique({
      where: { email: "grace@gmail.com" },
    });

    if (!existingAdmin) {
      const adminUser = await prisma.user.create({
        data: {
          name: "Grace Catalano",
          email: "grace@gmail.com",
          password: hashedPassword,
          role: "Admin",
        },
      });

      console.log("Admin user created:", adminUser);
    } else {
      const updatedUser = await prisma.user.update({
        where: { email: "grace@gmail.com" },
        data: { role: "Admin" },
      });
    }

    //games
    const categoryNames = [
      "Action-Adventure",
      "FPS",
      "RPG",
      "Simulation",
      "Strategy",
    ];

    await prisma.category.createMany({
      data: categoryNames.map((name) => ({ name })),
      skipDuplicates: true,
    });

    const categories = await prisma.category.findMany();
    const getCategoryId = (name) => categories.find((c) => c.name === name)?.id;

    // Games with categories
    const games = [
      { title: "The Last of Us", categories: ["Action-Adventure", "RPG"] },
      { title: "God of War", categories: ["Action-Adventure", "RPG"] },
      { title: "Valorant", categories: ["FPS"] },
      { title: "Slime Rancher", categories: ["Simulation"] },
      { title: "Stardew Valley", categories: ["Simulation", "RPG"] },
      { title: "Rimworld", categories: ["Simulation"] },
      { title: "The Sims 4", categories: ["Simulation"] },
      { title: "Horizon Zero Dawn", categories: ["Action-Adventure", "RPG"] },
      { title: "Sea of Thieves", categories: ["Action-Adventure", "FPS"] },
      { title: "Destiny 2", categories: ["FPS", "Action-Adventure"] },
      {
        title: "Red Dead Redemption 2",
        categories: ["Action-Adventure", "RPG"],
      },
      {
        title: "The Legend of Zelda: BOTW",
        categories: ["Action-Adventure", "RPG"],
      },
      { title: "Pokemon: Sword", categories: ["RPG"] },
      { title: "Beyond: Two Souls", categories: ["Action-Adventure"] },
      { title: "Until Dawn", categories: ["Action-Adventure"] },
      { title: "Life Is Strange", categories: ["Action-Adventure"] },
      { title: "Call of Duty: Ghosts", categories: ["FPS"] },
      { title: "Fortnite", categories: ["Action-Adventure", "FPS"] },
      { title: "Clash Royale", categories: ["Strategy"] },
      { title: "Oxygen Not Included", categories: ["Simulation", "Strategy"] },
    ];

    for (const game of games) {
      await prisma.game.create({
        data: {
          title: game.title,
          categories: {
            connect: game.categories.map((categoryName) => ({
              id: getCategoryId(categoryName),
            })),
          },
        },
      });
    }
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
