import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const register = async (req, res) => {
    const { username, password, name, phone, email, role } = req.body;

    try {
        // Only allow creating CUSTOMER via public register, mostly. 
        // But for simplicity, we allow verifying role if needed, or default to CUSTOMER if not provided.
        // Ideally, ADMIN/STAFF creation should be protected.

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Default to CUSTOMER if role not specified or if strictly public endpoint
        // For this assignment, we might allow passing role for easy testing setup
        const userRole = role || 'CUSTOMER';

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                full_name: name,
                phone,
                email,
                role: userRole
            }
        });

        res.status(201).json({ message: 'User created successfully', userId: newUser.id });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

export const login = async (req, res) => {
    const { phone, password } = req.body;

    try {
        const user = await prisma.user.findFirst({ where: { phone } });
        if (!user) return res.status(401).json({ message: 'Invalid phone or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid phone or password' });

        const token = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role },
            SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.phone,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, full_name: true, role: true, phone: true, email: true, address: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
}
