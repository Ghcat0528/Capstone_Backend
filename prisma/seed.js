const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function seed() {
    await prisma.game.createMany({
        data: [
            { title: "The Last of Us", genre: "Action-Adventure"},
            { title: "God of War", genre: "Action-Adventure"},
            { title: "Valorant", genre: "FPS"},
            { title: "Slime Rancher", genre: "Farm Life Sim"},
            { title: "Stardew Valley", genre: "Indie RPG"},
            { title: "Rimworld", genre: "Colony Building Sim"},
            { title: "The Sims 4", genre: "Life Sim"},
            { title: "Horizon Zero Dawn", genre: "Action RPG"},
            { title: "Sea of Thieves", genre: "Action-Adventure"},
            { title: "Destiny 2", genre: "FPS"},
            { title: "Red Dead Redemption 2", genre: "Action-Adventure"},
            { title: "The Legend of Zelda: BOTW ", genre: "Action-Adventure"},
            { title: "Pokemon: Sword", genre: "Adventure RPG"},
            { title: "Beyond: Two Souls", genre: "Action-Adventure"},
            { title: "Until Dawn", genre: "Interactive Drama"},
            { title: "Life Is Strange", genre: "Episodic Adventure"},
            { title: "Call of Duty: Ghosts", genre: "FPS"},
            { title: "Fortnite", genre: "Battle Royal"},
            { title: "Clash Royal", genre: "Real-time Strategy"},
            { title: "Oxygen Not Included", genre: "Colony Building Sim"},
        ]
    });
}

seed()
   .catch(e => console.error(e))
   .finally(async () => {
    await prisma.$disconnect();
   });