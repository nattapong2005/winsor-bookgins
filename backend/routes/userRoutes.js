import express from 'express';
import { getUsers, updateUser, deleteUser, createUser, getAvailableTechnicians } from '../controllers/userController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getUsers);
router.post('/', authorizeRole(['ADMIN']), createUser); // Admin create user
router.get('/technicians/available', authorizeRole(['ADMIN', 'COORDINATOR']), getAvailableTechnicians); // Check availability
router.put('/:id', updateUser);
router.delete('/:id', authorizeRole(['ADMIN']), deleteUser);

export default router;
