import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';

// Create User (Admin only)
export const createUser = async (req, res) => {
    const { username, password, full_name, phone, email, role, address } = req.body; // Aliasing name to full_name

    try {
        if (username) {
            const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
            if (existingUserByUsername) return res.status(400).json({ message: 'Username already exists' });
        }
        if (phone) {
            const existingUserByPhone = await prisma.user.findUnique({ where: { phone } });
            if (existingUserByPhone) return res.status(400).json({ message: 'Phone number already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                full_name, // Use full_name here
                phone,
                email,
                address,
                role: role || 'CUSTOMER' // Use lowercase role
            }
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// Get Technicians with availability status (for Coordinator)
export const getAvailableTechnicians = async (req, res) => {
    // NOTE: This function is deprecated due to schema changes.
    // The 'Booking' model no longer has a relation to 'User' (technician),
    // so it's not possible to determine technician availability this way.
    // Returning an empty array to prevent breaking the client.
    res.json([]);
};

export const getUsers = async (req, res) => {
    const { role } = req.query; // Filter by role optional
    try {
        const where = role ? { role: role.toUpperCase() } : {}; // Match Prisma enum (ADMIN, TECHNICIAN, etc.)
        const users = await prisma.user.findMany({
            where,
            select: { id: true, username: true, full_name: true, role: true, email: true, phone: true } // Use full_name
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, phone, email, password, address, role } = req.body; // Aliasing name to full_name

    // Security: only admin or self can update
    // NOTE: role in JWT should be lowercase
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    try {
        const data = {};
        if (full_name) data.full_name = full_name;
        if (phone) data.phone = phone;
        if (email) data.email = email;
        if (address) data.address = address;
        if (role) data.role = role;

        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data
        });

        // Remove password from response
        delete updatedUser.password;
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};
