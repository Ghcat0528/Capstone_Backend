const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

const registerUser = async (req, res) => {
    const { email, password, name} = req.body;
    const hashedPassword = await bcrypt.hash(password, 8)
    try{
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name},
        })
        res.status(201).json({ message: "You just got registered", user})
    } catch (error) {
        res.status(500).json({ error: "Didnt register you..."})
    }
};

const loginUser = async (req, res) => {
    const { email, password} = req.body;
    try{
        const user = await prisma.user.findUnique({
            where: {email}})
            if (!user || !(await bcrypt.compare(password, user.password))){
                return res.status(401).json({error: "You did something wrong"});
            }
        const token = jwt.sign({ userId: user.id}, process.env.JWT_SECRET, { expiresIn: '1h'});
            res.json({ message: "Logged in!", token})
        
    } catch(error) {
         res.status(500).json({ error: "We couldnt log you in"})
    }
};
module.exports = { registerUser, loginUser };