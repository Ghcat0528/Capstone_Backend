const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registerUser = async (req, res) => {
    const { name, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 7)

    try{
        const user = await prisma.user.create({
            data: {name, email, password: hashedPassword},
        });
        res.status(201).json({ message: "Registered", user});
    } catch (error) {
        res.status(400).json({ message: "Having trouble registering user"})
    }
};

const loginUser = async (req, res) => {
    const { email, password} = req.body;

    try{ 
        const user = await prisma.user.findUnique({ where: {email}});
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Not right.."});
        }
        const token = jwt.sign({ id: user.id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        res.json({ token, user});
    } catch (error) {
        res.status(500).json({ message: "Login error"});
    }
};

module.exports = { registerUser, loginUser}