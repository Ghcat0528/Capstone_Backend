const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');


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
      { title: "The Last of Us", categories: ["Action-Adventure", "RPG"], picture: 'https://upload.wikimedia.org/wikipedia/en/4/46/Video_Game_Cover_-_The_Last_of_Us.jpg' },
      { title: "God of War", categories: ["Action-Adventure", "RPG"], picture: 'https://m.media-amazon.com/images/M/MV5BNjJiNTFhY2QtNzZkYi00MDNiLWEzNGEtNWE1NzBkOWIxNmY5XkEyXkFqcGc@._V1_.jpg'},
      { title: "Valorant", categories: ["FPS"], picture: 'https://mediaproxy.tvtropes.org/width/1200/https://static.tvtropes.org/pmwiki/pub/images/valo2.png' },
      { title: "Slime Rancher", categories: ["Simulation"], picture: 'https://image.api.playstation.com/vulcan/img/cfn/11307NUlRPcxCgzizu6gpFZiR_WIqYHV9W0G8obBn0J1qCXY-SjbkzKihVNA3WzUQHbD08zWVaN-a7U5--t57lc-gckkQ0f-.png' },
      { title: "Stardew Valley", categories: ["Simulation", "RPG"], picture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHWjybGuWhdyJqjmtziGvtHvCnQf23yY0R6g&s' },
      { title: "Rimworld", categories: ["Simulation"], picture: 'https://cdn1.epicgames.com/offer/7051eadbb8c2435caf32a9bc0dc17936/rimworldwide_2560x1440-410a62ec21d44260409182e1174cce2e' },
      { title: "The Sims 4", categories: ["Simulation"], picture: 'https://image.api.playstation.com/vulcan/img/rnd/202111/3019/oXPtJkwSeNlYon2MqTX9K4sQ.png' },
      { title: "Horizon Zero Dawn", categories: ["Action-Adventure", "RPG"], picture: 'https://image.api.playstation.com/vulcan/ap/rnd/202409/2716/16b33fa9a5c7285ba86a035b4a1c5f8eb430b407eae35ffd.png' },
      { title: "Sea of Thieves", categories: ["Action-Adventure", "FPS"], picture: 'https://upload.wikimedia.org/wikipedia/en/7/77/Sea_of_thieves_cover_art.jpg'  },
      { title: "Destiny 2", categories: ["FPS", "Action-Adventure"], picture: 'https://upload.wikimedia.org/wikipedia/en/0/05/Destiny_2_%28artwork%29.jpg' },
      {
        title: "Red Dead Redemption 2",
        categories: ["Action-Adventure", "RPG"],
        picture: 'https://image.api.playstation.com/cdn/UP1004/CUSA03041_00/Hpl5MtwQgOVF9vJqlfui6SDB5Jl4oBSq.png'
      },
      {
        title: "The Legend of Zelda: BOTW",
        categories: ["Action-Adventure", "RPG"],
        picture: 'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg'
      },
      { title: "Pokemon: Sword", categories: ["RPG"], picture: 'https://m.media-amazon.com/images/M/MV5BYjlkYzMyMWMtNzM3ZS00Zjg2LTg2MjQtOGYyYWEyZGM4ZTY2XkEyXkFqcGc@._V1_QL75_UX190_CR0,2,190,281_.jpg' },
      { title: "Beyond: Two Souls", categories: ["Action-Adventure"], picture: 'https://upload.wikimedia.org/wikipedia/en/d/da/Beyond_Two_Souls_final_cover.jpg' },
      { title: "Until Dawn", categories: ["Action-Adventure"], picture: 'https://image.api.playstation.com/vulcan/ap/rnd/202401/2910/d48262b72a5a2daa3ca3aed6c8f42c44f3fdaf2902265a13.png' },
      { title: "Life Is Strange", categories: ["Action-Adventure"], picture: 'https://upload.wikimedia.org/wikipedia/en/0/0d/Life_Is_Strange_cover_art.png' },
      { title: "Call of Duty: Ghosts", categories: ["FPS"], picture: 'https://upload.wikimedia.org/wikipedia/en/9/9c/Call_of_duty_ghosts_box_art.jpg' },
      { title: "Fortnite", categories: ["Action-Adventure", "FPS"], picture: 'https://m.media-amazon.com/images/M/MV5BMTZlMmIxM2EtN2Y4Zi00M2ZhLTk3NzgtNjJmZTU0MTQ3YjcwXkEyXkFqcGc@._V1_.jpg' },
      { title: "Clash Royale", categories: ["Strategy"], picture: 'https://m.media-amazon.com/images/M/MV5BODYyYWVkODItMzVkYS00YThmLWFiNGQtYmI3ZGI4YWEzZDY3XkEyXkFqcGc@._V1_.jpg' },
      { title: "Oxygen Not Included", categories: ["Simulation", "Strategy"], picture: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Oxygen_Not_Included_cover_art.jpg'},
    ];

    for (const game of games) {
        await prisma.game.create({
          data: {
            title: game.title,
            picture: game.picture,  
            categories: {
              connect: game.categories.map((categoryName) => ({
                id: getCategoryId(categoryName),
              })),
            },
          },
        });
      }
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

seed();
